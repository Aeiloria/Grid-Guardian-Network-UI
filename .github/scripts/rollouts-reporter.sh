#!/usr/bin/env bash
# Entry points: bootstrap, start, finish. A report never fails the deploy.
report_rollouts_auth_failure() {
  message="$1"
  echo "Rollouts reporter: ${message}" >&2
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "::error title=Rollouts reporter::${message}" >&2
  fi
  if [ -n "${BUILDKITE:-}" ] && command -v buildkite-agent >/dev/null 2>&1; then
    buildkite-agent annotate --style error --context rollouts-reporter "${message}" || true
  fi
}
rollouts_stop_file="$(mktemp)"
rollouts_halt() {
  echo stopped > "$rollouts_stop_file"
  return 0
}
if [ -z "${CURSOR_API_KEY:-}" ]; then
  report_rollouts_auth_failure "CURSOR_API_KEY is missing. Create a team API key at https://cursor.com/dashboard/api-keys and store it as the CURSOR_API_KEY secret. The deploy continues."
  rollouts_halt
fi
rollouts_exchange() {
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  exchange_body="$(mktemp)"
  exchange_status="$(curl -sS -o "$exchange_body" -w "%{http_code}" -X POST https://api2.cursor.sh/auth/exchange_user_api_key \
    -H "Authorization: Bearer ${CURSOR_API_KEY}" -H "Content-Type: application/json" \
    -d '{}')" || {
    echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
    rollouts_halt
    return 0
  }
  case "$exchange_status" in
    401|403)
      status="$exchange_status"
      call="the token exchange"
      report_rollouts_auth_failure "CURSOR_API_KEY was rejected (HTTP ${status}) by ${call}. Replace the CURSOR_API_KEY secret with a team API key from https://cursor.com/dashboard/api-keys. A personal key or a key with no team access is rejected. The deploy continues."
      rollouts_halt
      return 0
      ;;
    2*)
      ;;
    *)
      echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
      rollouts_halt
      return 0
      ;;
  esac
  TOKEN="$(jq -r '.accessToken // empty' "$exchange_body" 2>/dev/null || true)"
  if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
    rollouts_halt
    return 0
  fi
}
rollouts_post() {
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  call="$1"
  url="$2"
  body="$3"
  allow409="${4:-}"
  response="$(mktemp)"
  status="$(curl -sS -o "$response" -w "%{http_code}" -X POST "$url" \
    -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" -H "Connect-Protocol-Version: 1" \
    -d "$body")" || {
    echo "Rollouts reporter: ${call} failed before a response. The deploy continues." >&2
    rollouts_halt
    return 0
  }
  case "$status" in
    401|403)
      report_rollouts_auth_failure "CURSOR_API_KEY was rejected (HTTP ${status}) by ${call}. Replace the CURSOR_API_KEY secret with a team API key from https://cursor.com/dashboard/api-keys. A personal key or a key with no team access is rejected. The deploy continues."
      rollouts_halt
      return 0
      ;;
  esac
  if [ "$status" = "409" ] && [ "$allow409" = "allow409" ]; then
    return 0
  fi
  if [ "$status" -ge 400 ]; then
    echo "Rollouts reporter: ${call} returned HTTP ${status}. The deploy continues." >&2
    rollouts_halt
    return 0
  fi
  cat "$response"
}
if [ ! -s "$rollouts_stop_file" ]; then
  rollouts_exchange
fi

rollouts_require_pair() {
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  if [ -z "${CHANGE_MONITOR_ENV:-}" ] || [ -z "${CHANGE_MONITOR_SERVICE:-}" ]; then
    echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
    rollouts_halt
  fi
}

rollouts_jq_or_halt() {
  if [ -s "$rollouts_stop_file" ]; then
    rollouts_body=""
    return 0
  fi
  if [ -z "$rollouts_body" ] || [ "$rollouts_body" = "null" ]; then
    echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
    rollouts_halt
  fi
}

rollouts_list_deployments() {
  rollouts_list_body="$(mktemp)"
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  rollouts_body="$(jq -nc \
    --arg source "https://github.com/${GITHUB_REPOSITORY}" \
    --arg env "${CHANGE_MONITOR_ENV}" \
    --arg version "${DEPLOY_VERSION}" \
    --arg service "${CHANGE_MONITOR_SERVICE}" \
    '{deploySourceUri:$source,filter:("environment = \"environments/"+$env+"\" AND deploy_version = \""+$version+"\" AND service = \"services/"+$service+"\""),pageSize:100,readMask:"events"}' || true)"
  rollouts_jq_or_halt
  rollouts_post ListDeployments "https://api.cursor.com/factory.v1.DeploymentsService/ListDeployments" \
    "$rollouts_body" > "$rollouts_list_body"
}

rollouts_deployment_for_actor() {
  jq -r --arg actor "${CHANGE_MONITOR_ACTOR}" '
    [ .deployments[]?
      | select(any(.events[]?; .actor == $actor))
      | .name
    ] | first // empty
  ' "$rollouts_list_body" 2>/dev/null || true
}

rollouts_actor_closed() {
  jq -r --arg actor "${CHANGE_MONITOR_ACTOR}" --arg name "$1" '
    [ .deployments[]?
      | select(.name == $name)
      | .events[]?
      | select(.actor == $actor and (has("completed") or has("aborted")))
    ] | length
  ' "$rollouts_list_body" 2>/dev/null || true
}

rollouts_bootstrap() {
  rollouts_require_pair
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  rollouts_body="$(jq -nc --arg env "${CHANGE_MONITOR_ENV}" \
    '{environmentId:$env,environment:{displayName:$env}}' || true)"
  rollouts_jq_or_halt
  rollouts_post CreateEnvironment "https://api.cursor.com/factory.v1.DeploymentsService/CreateEnvironment" \
    "$rollouts_body" allow409 >/dev/null
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  rollouts_body="$(jq -nc --arg service "${CHANGE_MONITOR_SERVICE}" \
    '{serviceId:$service,service:{displayName:$service}}' || true)"
  rollouts_jq_or_halt
  rollouts_post CreateService "https://api.cursor.com/factory.v1.DeploymentsService/CreateService" \
    "$rollouts_body" allow409 >/dev/null
}

rollouts_write_output() {
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  if [ -z "${DEPLOYMENT:-}" ] || [ "$DEPLOYMENT" = "null" ]; then
    echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
    rollouts_halt
    return 0
  fi
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "deployment=${DEPLOYMENT}" >> "$GITHUB_OUTPUT"
  fi
}

rollouts_start() {
  rollouts_require_pair
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  if [ -z "${DEPLOY_VERSION:-}" ] || [ -z "${CHANGE_MONITOR_ACTOR:-}" ]; then
    echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
    rollouts_halt
    return 0
  fi
  rollouts_list_deployments
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  DEPLOYMENT="$(rollouts_deployment_for_actor)"
  if [ -n "$DEPLOYMENT" ] && [ "$DEPLOYMENT" != "null" ]; then
    rollouts_write_output
    return 0
  fi
  deployment_body="$(mktemp)"
  rollouts_body=""
  if [ ! -s "$rollouts_stop_file" ]; then
    rollouts_body="$(jq -nc \
      --arg source "https://github.com/${GITHUB_REPOSITORY}" \
      --arg env "${CHANGE_MONITOR_ENV}" \
      --arg version "${DEPLOY_VERSION}" \
      --arg service "${CHANGE_MONITOR_SERVICE}" \
      --arg actor "${CHANGE_MONITOR_ACTOR}" \
      '{deployment:{deploySourceUri:$source,environment:("environments/"+$env),deployVersion:$version,service:("services/"+$service)},event:{started:{},actor:$actor}}' || true)"
    rollouts_jq_or_halt
  fi
  rollouts_post CreateDeployment "https://api.cursor.com/factory.v1.DeploymentsService/CreateDeployment" \
    "$rollouts_body" > "$deployment_body"
  DEPLOYMENT="$(jq -r '.deployment.name // empty' "$deployment_body" 2>/dev/null || true)"
  if [ ! -s "$rollouts_stop_file" ] && { [ -z "$DEPLOYMENT" ] || [ "$DEPLOYMENT" = "null" ]; }; then
    echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
    rollouts_halt
  fi
  rollouts_write_output
}

rollouts_finish() {
  rollouts_require_pair
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  if [ -z "${DEPLOY_VERSION:-}" ] || [ -z "${CHANGE_MONITOR_ACTOR:-}" ]; then
    echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
    rollouts_halt
    return 0
  fi
  case "${ROLLOUTS_OUTCOME:-}" in
    success|failure|cancelled|skipped)
      ;;
    *)
      echo "Rollouts reporter: Rollouts API unavailable, deploy not reported" >&2
      rollouts_halt
      return 0
      ;;
  esac
  rollouts_list_deployments
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  DEPLOYMENT="${ROLLOUTS_DEPLOYMENT:-}"
  if [ -z "$DEPLOYMENT" ] || [ "$DEPLOYMENT" = "null" ]; then
    DEPLOYMENT="$(rollouts_deployment_for_actor)"
  fi
  if [ -z "$DEPLOYMENT" ] || [ "$DEPLOYMENT" = "null" ]; then
    return 0
  fi
  closed="$(rollouts_actor_closed "$DEPLOYMENT")"
  if [ -n "$closed" ] && [ "$closed" != "0" ]; then
    return 0
  fi
  rollouts_body="$(jq -nc \
    --arg name "$DEPLOYMENT" \
    --arg actor "${CHANGE_MONITOR_ACTOR}" \
    --arg message "deploy step outcome: ${ROLLOUTS_OUTCOME}" \
    --arg outcome "${ROLLOUTS_OUTCOME}" \
    'if $outcome == "success" then
      {name:$name,event:{completed:{succeeded:{}},actor:$actor}}
    elif $outcome == "failure" then
      {name:$name,event:{completed:{failed:{message:$message}},actor:$actor}}
    elif $outcome == "cancelled" or $outcome == "skipped" then
      {name:$name,event:{aborted:{},actor:$actor}}
    else
      empty
    end' || true)"
  rollouts_jq_or_halt
  if [ -s "$rollouts_stop_file" ]; then
    return 0
  fi
  rollouts_post AppendDeploymentEvent "https://api.cursor.com/factory.v1.DeploymentsService/AppendDeploymentEvent" \
    "$rollouts_body" >/dev/null
}

case "${1:-}" in
  bootstrap) rollouts_bootstrap ;;
  start) rollouts_start ;;
  finish) rollouts_finish ;;
  *)
    echo "Rollouts reporter: unknown entry point '${1:-}'" >&2
    ;;
esac
exit 0
