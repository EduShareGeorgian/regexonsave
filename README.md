# Regex Replace on Save
## Automatically run RegExp replace text before saving a file.

Derivative of https://gitlab.com/ruthner97/vscode-regex-replace-on-save as we couldn't get it working.  This has been extended with more options, and our motivation was migrating liquibase changeset's to the latest version.

Added: 
    - runOnLoad -> runs the rule on load of the file, vs only on save
    - mode: the regex mode string
    - logging to console as it runs, so you can see if it works

## Options

- File Extension to apply replace rules to
- Find rule (regExp)
- Replace rule

### Example Configuration (settings.json):

```json
  {
    ...

    "regexonsave.rulesets": {
        "groovy": {
            "String column type to STRING": {
                "find": "(type:\\s*[\"'])\\b(string)\\b([\"'])",
                "mode": "gi",
                "replace": "$1STRING$3",
                "runOnLoad": true
            },
            "Numeric column type to NUMERIC": {
                "find": "(type:\\s*[\"'])\\b(numeric)\\b([\"'])",
                "mode": "gi",
                "replace": "$1NUMERIC$3",
                "runOnLoad": true
            },
            "Computed column type to COMPUTED": {
                "find": "(type:\\s*[\"'])\\b(Computed)\\b([\"'])",
                "mode": "gi",
                "replace": "$1COMPUTED$3",
                "runOnLoad": true
            },
            "Datetime column type to DATETIME": {
                "find": "(header:[\\s]*\\\"[\\S]*\\\"[\\s,]*)(type:[\\s]*\\\")(datetime)(\\\")",
                "mode": "gi",
                "replace": "$1$2DATE$4",
                "runOnLoad": true
            }

        }    
    }
}
```
