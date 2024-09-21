import { Modal, ModalContent } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function OnRampDialog({
  open,
  setOpen,
  targetWallet,
  onSuccessOnramp,
}) {
  const [counter, setCounter] = useState(0);
  const [orderStatus, setOrderStatus] = useState("Pending");

  // Simulate API call
  const checkOrderStatus = () => {
    console.log("Checking order status...");
  };

  useEffect(() => {
    if (counter >= 60) {
      setOpen(false);
      onSuccessOnramp();
    }
  }, [counter]);

  useEffect(() => {
    let secondTimer, apiTimer;

    if (open) {
      // Reset counter and status when modal opens
      setCounter(0);
      setOrderStatus("Pending");

      // Increment counter every second
      secondTimer = setInterval(() => {
        setCounter((prev) => prev + 1);
      }, 1000);

      // Check order status (call API) every 5 seconds
      apiTimer = setInterval(() => {
        checkOrderStatus();
      }, 5000);
    }

    // Cleanup both timers when modal closes
    return () => {
      clearInterval(secondTimer);
      clearInterval(apiTimer);
    };
  }, [open]);
  return (
    <Modal
      isOpen={open}
      onOpenChange={setOpen}
      size="lg"
      placement="center"
      hideCloseButton
    >
      <ModalContent className="flex flex-col w-full h-full max-h-[70vh]">
        <iframe
          id="onramp"
          width={"100%"}
          height={"100%"}
          src={`https://dynamic.banxa-sandbox.com/?walletAddress=${targetWallet}&coinType=USDC&blockchain=ETH`}
        />
      </ModalContent>
    </Modal>
  );
}
