"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefAttributes,
} from "react";
import {
  AnimatePresence,
  motion,
  type DOMMotionComponents,
  type HTMLMotionProps,
  type MotionProps,
} from "motion/react";

import { cn } from "@/lib/utils";

type CharacterSet = string[] | readonly string[];

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const;

type MotionElementType = Extract<
  keyof DOMMotionComponents,
  keyof typeof motionElements
>;
type HyperTextMotionComponent = ComponentType<
  Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLElement>
>;

interface HyperTextProps extends Omit<MotionProps, "children"> {
  /** The text content to be animated */
  children?: ReactNode;
  /** Explicit text prop (useful when invoked from Astro templates) */
  text?: string;
  /** Optional className for styling */
  className?: string;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Component to render as - defaults to div */
  as?: MotionElementType;
  /** Whether to start animation when element comes into view */
  startOnView?: boolean;
  /** Whether to trigger animation on hover */
  animateOnHover?: boolean;
  /** Custom character set for scramble effect. Defaults to uppercase alphabet */
  characterSet?: CharacterSet;
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
) as readonly string[];

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object") {
    if ("props" in node && node.props) {
      const p = node.props as Record<string, any>;
      if (typeof p.value === "string") return p.value;
      if (p.children) return extractText(p.children);
      if (p.dangerouslySetInnerHTML?.__html) {
        return p.dangerouslySetInnerHTML.__html.replace(/<[^>]*>/g, "");
      }
    }
  }
  return "";
}

export function HyperText({
  children,
  text,
  className,
  duration = 800,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  animateOnHover = true,
  characterSet = DEFAULT_CHARACTER_SET,
  ...props
}: HyperTextProps) {
  const MotionComponent = motionElements[Component] as HyperTextMotionComponent;
  const content = text ?? extractText(children);

  const [displayText, setDisplayText] = useState<string[]>(() =>
    content.split("")
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const iterationCount = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setDisplayText(content.split(""));
  }, [content]);

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      iterationCount.current = 0;
      setIsAnimating(true);
    }
  };

  // Handle animation start based on view or delay
  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setIsAnimating(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsAnimating(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-30% 0px -30% 0px" }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, startOnView]);

  // Handle scramble animation
  useEffect(() => {
    let animationFrameId: number | null = null;

    if (isAnimating) {
      const maxIterations = content.length;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        iterationCount.current = progress * maxIterations;

        setDisplayText((currentText) =>
          currentText.map((letter, index) =>
            letter === " "
              ? letter
              : index <= iterationCount.current
                ? content[index] ?? ""
                : characterSet[getRandomInt(characterSet.length)]
          )
        );

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [content, duration, isAnimating, characterSet]);

  // Group letters into words so the browser wraps whole words and never breaks a word across lines
  const words = useMemo(() => {
    const list: { letters: { char: string; index: number }[] }[] = [];
    let current: { char: string; index: number }[] = [];

    displayText.forEach((char, index) => {
      if (char === " ") {
        if (current.length > 0) {
          list.push({ letters: current });
          current = [];
        }
      } else {
        current.push({ char, index });
      }
    });
    if (current.length > 0) {
      list.push({ letters: current });
    }
    return list;
  }, [displayText]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn("overflow-hidden py-2 text-4xl font-bold", className)}
      onMouseEnter={handleAnimationTrigger}
      {...props}
    >
      <AnimatePresence>
        {words.map((word, wIdx) => (
          <Fragment key={wIdx}>
            <span className="inline-block whitespace-nowrap">
              {word.letters.map(({ char, index }) => (
                <motion.span
                  key={index}
                  className="inline-block"
                >
                  {char.toUpperCase()}
                </motion.span>
              ))}
            </span>
            {wIdx < words.length - 1 && " "}
          </Fragment>
        ))}
      </AnimatePresence>
    </MotionComponent>
  );
}
