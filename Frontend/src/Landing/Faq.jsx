import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import React from "react";

const faqData = [
  {
    id: "item-1",
    question: "What is Cold Mailer AI?",
    answer:
      "Cold Mailer AI is an AI-powered platform that helps you generate high-quality cold emails for sales, outreach, networking, job hunting, and more—instantly and effortlessly.",
  },
  {
    id: "item-2",
    question: "Do I need to be a copywriter to use this?",
    answer:
      "Not at all! Cold Mailer AI is designed for everyone—founders, sales reps, marketers, freelancers, and job seekers. Just enter a few details, and the AI handles the rest.",
  },
  {
    id: "item-3",
    question: "Can I customize the email after it's generated?",
    answer:
      "Yes, you can regenerate, edit, and fine-tune your email as many times as you need until you're happy with it.",
  },
  {
    id: "item-4",
    question: "Does it support different use-cases like sales or job outreach?",
    answer:
      // "Absolutely! We offer templates for various goals such as sales, partnerships, hiring, client follow-ups, and more.",
      "Absolutely! We offer email output for various goals such as sales, partnerships, hiring, client follow-ups, and more.",
  },
  {
    id: "item-5",
    question: "Do you offer a free trial?",
    answer:
      // "Yes, you can try Cold Mailer AI for free and generate a limited number of emails before deciding to upgrade.",
      "Yes, you can try Cold Mailer AI for free and generate a unlimited number of emails for your use cases.",
  },
  {
    id: "item-6",
    question: "Can I use it on mobile?",
    answer:
      "Yes, the platform is fully responsive and works smoothly on mobile, tablet, and desktop devices.",
  },
];


const Faq = () => {
  return (
    <div>
      <div className="absolute top-[55%] rotate-12 right-26 w-[70%] h-28 bg-[#6f34ed] opacity-25 blur-3xl"></div>
      
      <Accordion type="single" collapsible className="w-full z-40">
        {faqData.map(({ id, question, answer }) => (
          <AccordionItem key={id} value={id} className="mb-5">
            <AccordionTrigger className=" text-base text-gray-300 sm:text-xl py-4 px-9 rounded-t-full z-50">
              {question}
            </AccordionTrigger>
            <AccordionContent className="font-normal text-gray-200 text-base sm:text-lg px-9 pt-2">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Faq;