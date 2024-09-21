import Confetti from "react-dom-confetti";
import { isCreateLinkDialogAtom } from "../../store/dialog-store.js";
import { useAtom } from "jotai";
import { Button, Input, Modal, ModalContent } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Icons } from "../shared/Icons.jsx";
import Nounsies from "../shared/Nounsies.jsx";

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

export default function CreateLinkDialog({ onSuccess }) {
  const [isOpen, setOpen] = useAtom(isCreateLinkDialogAtom);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setOpen}
      isKeyboardDismissDisabled={true}
      hideCloseButton
      placement="center"
    >
      <ModalContent className="bg-white rounded-4xl p-8 max-w-[562px] flex flex-col items-start relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 bg-[#F8F8F8] rounded-full p-3"
        >
          <Icons.close classNamet="text-black size-6" />
        </button>

        {/* <StepOne /> */}
        <StepTwo />
      </ModalContent>
    </Modal>
  );
}

function StepOne() {
  return (
    <>
      <p className="text-2xl font-semibold">Create payment link</p>
      <p className="text-lg mt-4">
        Enter your client’s name or a unique alias to personalize your payment
        link. We'll also generate a Nounsies image for easy tracking and
        identification
      </p>
      <div className="mt-8 rounded-xl size-24 aspect-square bg-neutral-100 overflow-hidden mx-auto">
        <img
          src="/assets/nouns-placeholder.png"
          alt="nouns-placeholder"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-8 w-full flex items-center relative">
        <Input
          className="w-full"
          classNames={{
            mainWrapper: "rounded-2xl",
            inputWrapper: "h-16",
            input:
              "focus-visible:outline-purply text-base placeholder:text-neutral-300",
          }}
          placeholder="your-username"
          variant="bordered"
        />
        <p className="absolute right-4 text-neutral-400">squidl.me</p>
      </div>
      <Button className="h-16 rounded-full text-white flex items-center justify-center w-full mt-4 bg-purply-600">
        Continue
      </Button>
    </>
  );
}

function StepTwo() {
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setConfettiTrigger((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <p className="text-2xl font-semibold">Your Payment link is ready!</p>
      <p className="text-lg mt-4">
        Share it via email, social media, or copy and paste it anywhere. Manage
        and track payments easily from your dashboard
      </p>
      {/* Card */}
      <div className="relative w-full h-full mt-5">
        <img
          src="/assets/card.png"
          alt="card-placeholder"
          className="absolute w-full h-full object-cover rounded-2xl"
        />

        <div className="absolute right-5 top-5 size-12 rounded-full overflow-hidden">
          <Nounsies address={"maisontatsuya.jane.squidl.me"} />
        </div>

        <div className="relative w-full h-52 md:h-60 flex flex-col items-center justify-start py-7 px-6">
          <div className="flex flex-row gap-2 items-center mr-auto">
            <h1 className="text-white font-bold">
              maisontatsuya.jane.squidl.me
            </h1>

            <button onClick={() => onCopy("link")}>
              <Icons.copy className="text-[#848484] size-4" />
            </button>
          </div>

          <h1 className="absolute top-1/2 -translate-y-1/2 text-white font-extrabold text-2xl">
            $8,888,888.88
          </h1>

          <div className="absolute left-5 bottom-6 flex items-center justify-between">
            <h1 className="text-[#484B4E] font-bold text-2xl">SQUIDL</h1>
          </div>

          <div className="absolute right-5 bottom-6 flex items-center justify-between">
            <img
              src="/assets/squidl-logo-only.png"
              alt="logo"
              className="object-contain w-12 h-16"
            />
          </div>
        </div>
      </div>

      <Button className="h-16 rounded-full text-white flex items-center justify-center w-full mt-4 bg-purply-600">
        Start Sharing
      </Button>
      <Button className="h-16 rounded-full bg-transparent flex items-center justify-center w-full mt-1 text-purply-600">
        Go to dashboard
      </Button>
      <div className="absolute inset-0 overflow-hidden flex flex-col items-center mx-auto pointer-events-none">
        <Confetti
          active={confettiTrigger}
          config={confettiConfig}
          className="-translate-y-[4rem] translate-x-[0.4rem]"
        />
      </div>
    </>
  );
}
