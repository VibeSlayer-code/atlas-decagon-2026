import { MorphingCardStack } from "@/components/ui/morphing-card-stack";
import { Layers, Palette, Clock, Sparkles } from "lucide-react";

const cardData = [
  {
    id: "1",
    title: "Photosynthesis",
    description: "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    id: "2",
    title: "Newton's First Law",
    description: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This is also known as the law of inertia.",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    id: "3",
    title: "Pythagorean Theorem",
    description: "In a right-angled triangle, the square of the length of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the lengths of the other two sides. Formula: a² + b² = c²",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "4",
    title: "Mitosis",
    description: "A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus. It consists of four phases: prophase, metaphase, anaphase, and telophase.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "5",
    title: "Supply and Demand",
    description: "An economic model of price determination in a market. It postulates that in a competitive market, the unit price for a particular good will vary until it settles at a point where the quantity demanded equals the quantity supplied.",
    icon: <Layers className="h-5 w-5" />,
  },
];

export default function DemoOne() {
  return (
    <div className="min-h-screen bg-[#0c0515] flex items-center justify-center p-8">
      <MorphingCardStack 
        cards={cardData} 
        defaultLayout="stack"
        onCardClick={(card) => console.log("Clicked:", card.title)}
      />
    </div>
  );
}
