import { Button, Modal, ModalContent } from "@nextui-org/react";
import { Icons } from "../shared/Icons.jsx";
import toast from "react-hot-toast";
import Chains from "../shared/Chains.jsx";

export default function QrDialog({ open, setOpen, qrUrl }) {
  const onCopy = (text) => {
    toast.success("Copied to clipboard", {
      id: "copy",
      duration: 1000,
      position: "bottom-center",
    });
    navigator.clipboard.writeText(text);
  };

  const handleShare = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const file = new File([blob], "image.png", { type: blob.type });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Share Image",
          text: "Check out this image!",
          files: [file],
        });
        console.log("Image shared successfully!");
      } else {
        alert("Web Share API is not supported in your browser.");
      }
    } catch (error) {
      console.error("Error sharing the image:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const link = document.createElement("a");

      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = "qr-code.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={setOpen}
      size="md"
      placement="center"
      hideCloseButton
    >
      <ModalContent className="relative flex flex-col rounded-4xl items-center justify-center gap-5 p-6">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-6 top-6 bg-[#F8F8F8] rounded-full p-3"
        >
          <Icons.close classNamet="text-black size-6" />
        </button>

        <img
          src="/assets/squidl-logo.png"
          alt="logo"
          className="object-contain w-auto h-10"
        />

        <h1 className="font-medium text-xl text-[#19191B]">Your QR Code</h1>

        <div className="px-5 md:px-12">
          <div className="bg-[#563EEA] rounded-[24px] px-5 py-4 flex flex-col items-center justify-center w-full">
            <div className="w-full h-full bg-white p-5 rounded-[24px]">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/1200px-QR_Code_Example.svg.png"
                alt="qr"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-row items-center gap-2.5 mt-3">
              <h1 className="font-medium text-lg text-[#F4F4F4]">
                jane.squidl.me
              </h1>
              <button onClick={() => onCopy("link")}>
                <Icons.copy className="text-[#B9BCFF]" />
              </button>
            </div>
          </div>
        </div>

        <Chains />

        <div className="flex w-full items-center gap-4 mt-2">
          <Button
            onClick={handleDownload}
            className="bg-[#563EEA] rounded-4xl h-14 text-white text-sm w-full"
          >
            Download
          </Button>
          <Button
            onClick={handleShare}
            className="bg-[#E9ECFC] rounded-4xl h-14 text-[#563EEA] text-sm w-full"
          >
            Share
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
