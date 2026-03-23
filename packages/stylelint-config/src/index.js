export function createStylelintConfig() {
  return {
    extends: ["stylelint-config-standard", "stylelint-config-standard-vue"],
    plugins: ["stylelint-order"],
    overrides: [
      {
        files: ["**/*.less"],
        customSyntax: "postcss-less"
      },
      {
        files: ["**/*.vue"],
        customSyntax: "postcss-html"
      }
    ],
    rules: {
      "selector-class-pattern": null,
      "at-rule-no-unknown": [
        true,
        {
          ignoreAtRules: [
            "tailwind",
            "apply",
            "layer",
            "screen",
            "config",
            "unocss",
            "use",
            "forward",
            "mixin",
            "include",
            "function",
            "return",
            "if",
            "else",
            "each",
            "for",
            "while"
          ]
        }
      ],
      "function-no-unknown": [
        true,
        {
          ignoreFunctions: [
            "v-bind",
            "theme",
            "percentage",
            "extract",
            "length",
            "each",
            "range",
            "min",
            "max",
            "mod",
            "pow",
            "sqrt",
            "abs",
            "sin",
            "cos",
            "tan",
            "atan",
            "pi",
            "ceil",
            "floor",
            "percentage",
            "round",
            "convert",
            "unit",
            "color",
            "data-uri",
            "default",
            "get-unit",
            "svg-gradient",
            "escape",
            "e",
            "replace",
            "isnumber",
            "isstring",
            "iscolor",
            "iskeyword",
            "isurl",
            "ispixel",
            "isem",
            "ispercentage",
            "isunit",
            "isruleset",
            "isdefined"
          ]
        }
      ],
      "no-descending-specificity": null,
      "selector-max-id": null,
      "selector-max-type": null,
      "selector-no-qualifying-type": null,
      "selector-pseudo-class-no-unknown": [
        true,
        {
          ignorePseudoClasses: ["global", "local", "deep", "v-deep", "v-global", "v-slotted"]
        }
      ],
      "selector-pseudo-element-no-unknown": [
        true,
        {
          ignorePseudoElements: ["v-deep", "v-global", "v-slotted"]
        }
      ],
      "color-hex-length": null,
      "color-named": "never",
      "color-function-notation": null,
      "alpha-value-notation": null,
      "declaration-block-no-duplicate-properties": true,
      "declaration-block-no-shorthand-property-overrides": true,
      "property-no-unknown": [
        true,
        {
          ignoreProperties: ["contains", "appearance", "primary", "secondary"]
        }
      ],
      "shorthand-property-no-redundant-values": true,
      "declaration-property-value-no-unknown": null,
      "value-keyword-case": null,
      "value-no-vendor-prefix": null,
      "comment-no-empty": true,
      "media-feature-name-no-unknown": true,
      "media-feature-range-notation": null,
      "media-query-no-invalid": null,
      "keyframes-name-pattern": null,
      "font-family-name-quotes": "always-where-recommended",
      "font-family-no-duplicate-names": true,
      "unit-allowed-list": null,
      "rule-empty-line-before": null,
      "order/properties-order": null
    }
  };
}

const config = createStylelintConfig();

export default config;
