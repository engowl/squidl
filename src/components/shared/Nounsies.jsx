import { useState, useEffect } from "react";
import ipfsLinks from "../../assets/traitsIpfsLinks.json";
import { Skeleton } from "@nextui-org/react";

const simpleHash = (address) => {
  return address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const generateColorFromAddress = (address) => {
  const hash = simpleHash(address);
  const hue = hash % 360;
  const saturation = 50 + (hash % 50); // Keep saturation between 50-100%
  const lightness = 70 + (hash % 30); // Keep lightness between 70-100%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Function to select a trait from IPFS based on the address hash
const getTraitFromHash = (hash, traitCategory) => {
  const traitArray = ipfsLinks[traitCategory];
  return traitArray[hash % traitArray.length].url;
};

export default function Nounsies({ address }) {
  const [body, setBody] = useState("");
  const [accessory, setAccessory] = useState("");
  const [head, setHead] = useState("");
  const [glassesItem, setGlassesItem] = useState("");
  const [isLoading, setLoading] = useState(true); // Initially loading
  const [imagesLoaded, setImagesLoaded] = useState(0); // Track how many images are loaded

  useEffect(() => {
    const hash = simpleHash(address);

    // Select traits based on hash
    setBody(getTraitFromHash(hash, "1-bodies"));
    setAccessory(getTraitFromHash(hash, "2-accessories"));
    setHead(getTraitFromHash(hash, "3-heads"));
    setGlassesItem(getTraitFromHash(hash, "4-glasses"));
  }, [address]);

  // Track image load completion
  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  // Check if all images are loaded
  useEffect(() => {
    if (imagesLoaded === 4) {
      setLoading(false);
    }
  }, [imagesLoaded]);

  // Generate unique background color
  const backgroundColor = generateColorFromAddress(address);

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <Skeleton className="absolute inset-0 light bg-neutral-200" />
      )}

      {/* Render images regardless of loading state */}
      {body && (
        <img
          src={body}
          alt="body"
          style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
          onLoad={handleImageLoad}
        />
      )}
      {head && (
        <img
          src={head}
          alt="head"
          style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
          onLoad={handleImageLoad}
        />
      )}
      {accessory && (
        <img
          src={accessory}
          alt="accessory"
          style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
          onLoad={handleImageLoad}
        />
      )}
      {glassesItem && (
        <img
          src={glassesItem}
          alt="glasses"
          style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
          onLoad={handleImageLoad}
        />
      )}
    </div>
  );
}
