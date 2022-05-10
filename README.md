# Askgod Discourse YAML validator

This action parses all YAML files present in a given directory and ensures their template will be valid for the Askgod Discourse integration.

## Inputs

## `path_to_files`

**Required** The directory where all the YAML files lives (default: `scenario`)

## `api_users`

An optional comma separated list of valid API user names that can be used in templates

## Example usage

```yaml
uses: nsec/askgod-discourse-validator@v1.0
with:
  path_to_files: 'scenario'
```