import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Skeleton,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";
import SquidlLogo from "../../assets/squidl.svg?react";
import { useAtom } from "jotai";
import { isGetStartedDialogAtom } from "../../store/dialog-store";
import toast from "react-hot-toast";
import { squidlAPI } from "../../api/squidl";
import { useUserWallets } from "@dynamic-labs/sdk-react-core";
import Nounsies from "../shared/Nounsies";
import useSWR from "swr";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../../providers/Web3Provider";

const confettiConfig = {
  angle: 90,
  spread: 300,
  startVelocity: 20,
  elementCount: 60,
  dragFriction: 0.1,
  duration: 3000,
  stagger: 3,
  width: "8px",
  height: "8px",
  perspective: "500px",
};

export default function GetStartedDialog() {
  const [isOpen, setOpen] = useAtom(isGetStartedDialogAtom);

  const [step, setStep] = useState("one");

  return (
    <Modal
      isOpen={isOpen}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      hideCloseButton
      placement="center"
    >
      <ModalContent className="bg-white rounded-4xl p-8 max-w-[562px] flex flex-col items-start relative">
        {step === "one" ? (
          <StepOne setStep={setStep} />
        ) : (
          <StepTwo setOpen={setOpen} />
        )}
      </ModalContent>
    </Modal>
  );
}

function StepOne({ setStep }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const { contract } = useWeb3();

  async function handleUpdate() {
    if (!username) {
      return toast.error("Please provide a username");
    }

    setLoading(true);

    let id;

    try {
      const res = await squidlAPI.post("/user/update-user", {
        username: username,
      });
      console.log({ res });
      id = toast.loading(
        "Your username has been created!, creating meta address"
      );
      const authSigner = localStorage.getItem("auth_signer");
      const tx = await contract.register(JSON.parse(authSigner));
      const hash = await tx.wait();
      console.log({ hash, tx });
      toast.success("Meta address and username has been created");
      setStep("two");
    } catch (e) {
      toast.error("Error creating your username");
    } finally {
      toast.dismiss(id);
      setLoading(false);
    }
  }
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
          value={username}
          onChange={(e) => {
            const val = e.target.value;
            setUsername(val);
          }}
          placeholder="your-username"
          variant="bordered"
        />
        <p className="absolute right-4 text-neutral-400">squidl.me</p>
      </div>
      <Button
        onClick={handleUpdate}
        loading={loading}
        isDisabled={loading}
        className="h-16 rounded-full text-white flex items-center justify-center w-full mt-4 bg-purply-600"
      >
        Continue
      </Button>
    </>
  );
}

function StepTwo({ setOpen }) {
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const userWallets = useUserWallets();
  const { data: user, isLoading } = useSWR("/auth/me", async (url) => {
    const { data } = await squidlAPI.get(url);
    return data;
  });

  const navigate = useNavigate();

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
          {isLoading ? (
            <Skeleton className="w-24 h-8 rounded-md" />
          ) : (
            <p className="text-xl">{user.username}.squidl.me</p>
          )}
        </div>
        <div className="bg-purply-50 flex-1 flex flex-col justify-end">
          <div className="w-full flex items-end justify-between py-5 px-6">
            <p className="text-purply-600 text-2xl font-medium">SQUIDL</p>
            <SquidlLogo className="w-14" />
          </div>
        </div>
        {/* Image */}
        <div className="absolute size-24 top-6 left-6 rounded-xl bg-neutral-200 overflow-hidden">
          <Nounsies address={userWallets[0]?.address} />
        </div>
      </div>

      <Button
        onClick={async () => {
          await navigator.share({
            title: "Link",
            text: `${user.username}.squidl.me`,
          });
        }}
        className="h-16 rounded-full text-white flex items-center justify-center w-full mt-4 bg-purply-600"
      >
        Start Sharing
      </Button>
      <Button
        onClick={() => {
          setOpen(false);
          navigate("/");
        }}
        className="h-16 rounded-full bg-transparent flex items-center justify-center w-full mt-1 text-purply-600"
      >
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
