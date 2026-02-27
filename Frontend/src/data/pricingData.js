import { Zap, Crown } from "lucide-react";

export const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for trying AI-powered email generation",
    icon: Zap,
    iconClassName: "h-6 w-6 text-[#6f34ed]",
    features: [
      "50 emails per month",
      "Basic email templates",
      "Standard tone options",
      "Copy & export functionality",
    ],
    buttonText: "Get Started",
    id: "GETSTARTED",
    buttonVariant: "outline",
    popular: false,
  },
  {
    name: "Professional",
    price: "₹9",
    period: "per month",
    description: "Ideal for professionals and small teams",
    icon: Crown,
    iconClassName: "h-6 w-6 text-[#6f34ed]",
    features: [
      "500 emails per month",
      "Advanced personalization",
      "All tone customizations",
      "Priority email support",
      "Unlimited revisions",
    ],
    buttonText: "Start Free Trial",
    id: "STARTFREETRIAL",
    buttonVariant: "default",
    popular: true,
  },
];
