import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";
import SquidlLogo from "../../assets/squidl.svg?react";
import { useAtom } from "jotai";
import { isGetStartedDialogAtom } from "../../store/dialog-store";

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

export default function GetStartedDialog() {
  const [isOpen, setOpen] = useAtom(isGetStartedDialogAtom);

  const [step, setStep] = useState(false);

  const onOpenChange = () => {};

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      hideCloseButton
    >
      <ModalContent className="bg-white rounded-4xl p-8 max-w-[562px] flex flex-col items-start relative">
        <StepOne />
        {/* <StepTwo /> */}
      </ModalContent>
    </Modal>
  );
}

function StepOne() {
  return (
    <>
      <p className="text-2xl font-semibold">Let's get started!</p>
      <p className="text-lg mt-4">
        Pick a cool username for your Squidl. This will be your payment link and
        ENS, so anyone can easily send you money
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
      <p className="text-2xl font-semibold">You're all set!</p>
      <p className="text-lg mt-4">
        Your Squidl username is live and ready for action. Share it with anyone
        to start receiving payments like a pro
      </p>
      {/* Card */}
      <div className="w-full rounded-2xl bg-purply-600 h-[221px] mt-5 flex flex-col overflow-hidden relative">
        <div className="w-full flex items-center justify-end px-6 py-5 text-white">
          <p className="text-xl">your-username.squidl.me</p>
        </div>
        <div className="bg-purply-50 flex-1 flex flex-col justify-end">
          <div className="w-full flex items-end justify-between py-5 px-6">
            <p className="text-purply-600 text-2xl font-medium">SQUIDL</p>
            <SquidlLogo className="w-14" />
          </div>
        </div>
        {/* Image */}
        <div className="absolute size-24 top-6 left-6 rounded-xl bg-neutral-200"></div>
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
