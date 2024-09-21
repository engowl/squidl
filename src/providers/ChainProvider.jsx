const chainConfigs =
  import.meta.VITE_APP_ENVIRONMENT === "production" ? [] : {};

export default function ChainProvider({ children }) {
  return <>{children}</>;
}
