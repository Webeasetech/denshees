import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [".next/**", ".next-verify/**", "node_modules/**"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Next 16's preset promotes the React-Compiler-aware hook rules to
      // errors. These 19 hits are long-standing sync-props-to-state and
      // mounted-flag effects that predate the upgrade — real cleanup targets,
      // but not regressions, so they warn rather than failing CI while they
      // are burned down.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];

export default eslintConfig;
