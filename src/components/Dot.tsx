import { cva, type VariantProps } from 'class-variance-authority';

const dotStyles = cva(
  'h-16 rounded-full border-4 transition-all duration-50',
  {
    variants: {
      variant: {
        space: 'w-32 rounded-xl',
        key: 'w-16',
      },
      isPressed: {
        true: 'scale-105',
      },
      isTarget: {
        true: '',
      },
      isPlayer: {
        true: '',
      }
    },
    compoundVariants: [
      {
        isTarget: true,
        isPressed: true,
        className: 'bg-black opacity-100',
      },
      {
        isTarget: true,
        isPressed: false,
        className: 'bg-transparent opacity-30 border-white',
      },
      {
        isPlayer: true,
        isPressed: true,
        className: 'bg-white opacity-100 border-white',
      },
      {
        isPlayer: true,
        isPressed: false,
        className: 'bg-transparent opacity-30 border-white',
      }
    ],
    defaultVariants: {
      variant: 'key',
    },
  }
);

type DotProps = VariantProps<typeof dotStyles>;

function Dot({ variant, isPressed, isTarget, isPlayer }: DotProps) {
  return <div className={dotStyles({ variant, isPressed, isTarget, isPlayer })} />;
}

export default Dot;
