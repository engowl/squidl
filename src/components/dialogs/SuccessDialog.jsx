import { Button, Modal, ModalContent } from "@nextui-org/react";
import { Icons } from "../shared/Icons.jsx";

const confettiConfig = {
  angle: 90, // Angle at which the confetti will explode
  spread: 300, // How much area the confetti will cover
  startVelocity: 20, // Starting speed of the particles
  elementCount: 60, // Number of confetti pieces
  dragFriction: 0.1, // Drag friction applied to particles
  duration: 3000, // How long the confetti effect lasts
  stagger: 3, // Delay between confetti particle launch
  width: "8px", // Width of confetti pieces
  height: "8px", // Height of confetti pieces
  perspective: "500px", // Perspective value for 3D effect
};
import Confetti from "react-dom-confetti";
import { useEffect, useState } from "react";

export default function SuccessDialog({
  open,
  setOpen,
  title,
  caption,
  topButtonHandler,
  topButtonTitle,
  botButtonHandler,
  botButtonTitle,
}) {
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  useEffect(() => {
    setConfettiTrigger((_) => open);
  }, [open]);

  return (
    <>
      <Modal
        isOpen={open}
        onOpenChange={setOpen}
        size="md"
        placement="center"
        hideCloseButton
        isDismissable={false}
      >
        <ModalContent className="relative flex flex-col rounded-4xl items-center justify-center gap-6 p-6">
          <div className="flex items-center justify-between gap-3 w-full">
            <h1 className="font-bold text-xl">{title}</h1>
            <button
              onClick={() => setOpen(false)}
              className="bg-[#F8F8F8] rounded-full p-3"
            >
              <Icons.close className="text-black size-6" />
            </button>
          </div>

          <video
            src={"/assets/spy.mp4"}
            loop
            autoPlay
            muted
            playsInline
            controls={false}
            className="object-contain w-full h-full rounded-full overflow-hidden"
            style={{
              pointerEvents: "none",
              userSelect: "none",
              touchAction: "none",
            }}
          />

          <p className="text-center font-medium text-sm text-[#19191B]">
            {caption}
          </p>

          <div className="flex flex-col gap-2 w-full">
            {topButtonHandler && (
              <Button
                onClick={topButtonHandler}
                className="text-[#19191B] font-sm h-14 w-full rounded-4xl bg-[#F9F9FA]"
              >
                {topButtonTitle}
              </Button>
            )}
            <Button
              onClick={botButtonHandler}
              className="text-white font-sm h-14 w-full rounded-4xl bg-[#563EEA]"
            >
              {botButtonTitle}
            </Button>
          </div>
          <div className="absolute inset-0 overflow-hidden flex flex-col items-center mx-auto pointer-events-none">
            <Confetti
              active={confettiTrigger}
              config={confettiConfig}
              className="-translate-y-[4rem] translate-x-[0.4rem]"
            />
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
