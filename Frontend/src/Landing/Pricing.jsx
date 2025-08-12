import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Crown, Rocket } from "lucide-react"
import { isTokenExpired, useLogout } from "../Helper/tokenValidation"
import { useNavigate } from "react-router-dom"
import { usePayment } from "../hooks/usePayment"
import { useSelector } from "react-redux"

export default function PricingSection() {

  const userData = useSelector(state => state.auth.userData);
  const navigate = useNavigate()
  const logoutUser = useLogout();
  const {
    loading,
    error,
    success,
    processPayment,
    getPaymentPlans,
    getPaymentHistory,
    resetPaymentState,
  } = usePayment();

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for trying AI-powered email generation",
      icon: <Zap className="h-6 w-6 text-[#6f34ed]" />,
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
      icon: <Crown className="h-6 w-6 text-[#6f34ed]" />,
      features: [
        "500 emails per month",
        "Advanced personalization",
        "All tone customizations",
        "Priority email support",
        // "CRM integrations",
        // "Analytics dashboard",
        "Unlimited revisions",
      ],
      buttonText: "Start Free Trial",
      id: "STARTFREETRIAL",
      buttonVariant: "default",
      popular: true,
    },
  ]

  const token = JSON.parse(localStorage.getItem('token')) || null;
  
  const handleNavigation = async (buttonName) => {
    console.log("button", buttonName);
  
    if (!token) {
      logoutUser("Please Login, Token not found. ");
      return;
    }
    if (isTokenExpired(token)) {
      logoutUser("Session expired. Please log in again.");
      return;
    }
    
    if (token) {
      if (buttonName === "GETSTARTED") {
        navigate('/generate-email')
      }
      else {
        try {
          resetPaymentState();
          await processPayment(buttonName, {
            username: userData.username,
            email: userData.email,
            userId: userData._id,
          });
        } catch (error) {
          console.error('Payment failed:', error);
        }
      }
    }
    else {
      navigate('/')
    }
  } 

  return (
    <div className="w-full max-w-7xl mx-auto container px-5 md:px-6 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="max-w-24 flex justify-center bg-[#16151c] mx-auto rounded-full px-4 py-2 mb-8">
          <span className="text-sm sm:text-base font-normal text-gray-200">Pricing</span>
        </div>  

        <h2 className="text-2xl md:text-5xl text-center text-white font-bold mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-300 px-2 md:px-0 max-w-2xl text-center mx-auto mb-8 md:mb-12">
          Start free and scale as you grow. <br /> All plans include our core AI-powered email generation features.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 max-w-[800px] mx-auto">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative bg-slate-900/50 border-slate-800 backdrop-blur-sm ${
              plan.popular ? "ring-2 ring-[#6f34ed] scale-105" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#6f34ed] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">{plan.icon}</div>
              <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.price !== "Free" && <span className="text-slate-400 ml-2">/{plan.period}</span>}
                {plan.price === "Free" && <span className="text-slate-400 ml-2">{plan.period}</span>}
              </div>
              <CardDescription className="text-slate-400">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-slate-300">
                    <Check className="h-4 w-4 text-[#6f34ed] mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.buttonVariant === "default"
                    ? "bg-[#6f34ed] hover:from-purple-600 hover:to-purple-700 text-white"
                    : "bg-gray-800 border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
                variant={plan.buttonVariant}
                size="lg"
                onClick={() => handleNavigation(plan.id)}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
