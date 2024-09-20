import GetStartedDialog from "../components/dialogs/GetStartedDialog";

export default function GlobalComponentProvider({ children }) {
  return (
    <>
      {children}
      <GetStartedDialog />
    </>
  );
}
