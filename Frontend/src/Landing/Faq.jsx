import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import React from "react";

const faqData = [
  {
    id: "item-1",
    question: "What is Vidya Nexus?",
    answer:
      "Vidya Nexus is a comprehensive platform designed to manage and streamline various administrative tasks, including attendance, grading, scheduling, communication, and more, all in one place.",
  },
  {
    id: "item-2",
    question: "How easy is it to implement the system?",
    answer:
      "Vidya Nexus is user-friendly and can be implemented with minimal setup, ensuring a smooth transition for educational institutions.",
  },
  {
    id: "item-3",
    question: "Does the system support mobile devices?",
    answer:
      "Yes, Vidya Nexus is fully responsive and accessible on mobile devices, allowing users to manage tasks on the go.",
  },
  {
    id: "item-4",
    question: "Can the system track both teachers and students?",
    answer:
      "Yes, it provides tracking and reporting features for both teachers and students to monitor progress and activities effectively.",
  },
  {
    id: "item-5",
    question: "Can I try the system before purchasing?",
    answer:
      "Yes, we offer a free trial so you can explore all the features before making a decision.",
  },
  {
    id: "item-5",
    question: "Can I try the system before purchasing?",
    answer:
      "Yes, we offer a free trial so you can explore all the features before making a decision.",
  },
];

const Faq = () => {
  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
        {faqData.map(({ id, question, answer }) => (
          <AccordionItem key={id} value={id} className="mb-5">
            <AccordionTrigger className="font-light text-base text-gray-300 sm:text-xl py-4 px-9 rounded-t-full">
              {question}
            </AccordionTrigger>
            <AccordionContent className="font-normal text-gray-200 text-base sm:text-lg px-9">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Faq;