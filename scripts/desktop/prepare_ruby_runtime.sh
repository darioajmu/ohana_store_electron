#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
STAGE_ROOT="${REPO_ROOT}/tmp/desktop-runtime"
RUNTIME_ROOT="${STAGE_ROOT}/ruby"
METADATA_PATH="${STAGE_ROOT}/metadata.json"

RUBY_BIN_PATH="${OHANA_DESKTOP_RUBY_BIN:-$(command -v ruby)}"

if [[ -z "${RUBY_BIN_PATH}" ]]; then
  echo "Could not find a Ruby binary to package." >&2
  exit 1
fi

RUBY_PREFIX="$("${RUBY_BIN_PATH}" -e 'require "rbconfig"; print RbConfig::CONFIG["prefix"]')"
RUBY_VERSION="$("${RUBY_BIN_PATH}" -e 'print RUBY_VERSION')"
RUBY_API_VERSION="$("${RUBY_BIN_PATH}" -e 'require "rbconfig"; print RbConfig::CONFIG["ruby_version"]')"
GEM_HOME="$("${RUBY_BIN_PATH}" -e 'require "rubygems"; print Gem.default_dir')"
RUBY_SHARED_LIB="$("${RUBY_BIN_PATH}" -e 'require "rbconfig"; print RbConfig::CONFIG["LIBRUBY_SO"]')"

echo "Staging Ruby runtime from ${RUBY_PREFIX}"

rm -rf "${STAGE_ROOT}"
mkdir -p "${RUNTIME_ROOT}"

rsync -a \
  --delete \
  --exclude 'doc/' \
  --exclude 'share/doc/' \
  --exclude 'share/ri/' \
  "${RUBY_PREFIX}/bin" \
  "${RUBY_PREFIX}/lib" \
  "${RUBY_PREFIX}/include" \
  "${RUBY_PREFIX}/share" \
  "${RUNTIME_ROOT}/"

rewrite_libruby_reference() {
  local target_path="$1"
  local old_ref="${RUBY_PREFIX}/lib/${RUBY_SHARED_LIB}"
  local rel_to_lib

  rel_to_lib="$(python3 - <<PY
import os
target = os.path.realpath(${target_path@Q})
runtime_root = os.path.realpath(${RUNTIME_ROOT@Q})
lib_path = os.path.join(runtime_root, "lib", ${RUBY_SHARED_LIB@Q})
print(os.path.relpath(lib_path, os.path.dirname(target)))
PY
)"

  install_name_tool -change "${old_ref}" "@loader_path/${rel_to_lib}" "${target_path}"
}

if [[ -f "${RUNTIME_ROOT}/lib/${RUBY_SHARED_LIB}" ]]; then
  install_name_tool -id "@rpath/${RUBY_SHARED_LIB}" "${RUNTIME_ROOT}/lib/${RUBY_SHARED_LIB}"
fi

if [[ -f "${RUNTIME_ROOT}/bin/ruby" ]]; then
  install_name_tool -change "${RUBY_PREFIX}/lib/${RUBY_SHARED_LIB}" "@executable_path/../lib/${RUBY_SHARED_LIB}" "${RUNTIME_ROOT}/bin/ruby"
fi

while IFS= read -r native_file; do
  rewrite_libruby_reference "${native_file}"
done < <(find "${RUNTIME_ROOT}" \( -name '*.bundle' -o -name '*.dylib' \) -type f)

cat > "${METADATA_PATH}" <<EOF
{
  "rubyBin": "ruby/bin/ruby",
  "rubyVersion": "${RUBY_VERSION}",
  "rubyApiVersion": "${RUBY_API_VERSION}",
  "gemHome": "ruby/lib/ruby/gems/${RUBY_API_VERSION}"
}
EOF

echo "Ruby runtime staged at ${STAGE_ROOT}"
