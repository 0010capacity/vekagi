import { motion } from 'framer-motion'
import type { PieceToken } from '@/types/game'
import { PIECES } from '@/data/pieces'
import { clsx } from 'clsx'

interface Props {
  piece: PieceToken
  isSelected: boolean
}

export function PieceTokenComponent({ piece, isSelected }: Props) {
  const def = PIECES.find(p => p.id === piece.definitionId)
  const isPlayer = piece.owner === 'player'

  return (
    <motion.div
      layoutId={piece.instanceId}
      layout
      className={clsx(
        'w-12 h-12 sm:w-14 sm:h-14 rounded flex flex-col items-center justify-center text-white cursor-pointer select-none relative',
        isPlayer ? 'bg-[#185FA5]' : 'bg-[#A32D2D]',
        isSelected && 'ring-2 ring-yellow-400 scale-105',
        piece.isSealed && 'opacity-50',
        piece.isDead && 'opacity-30 grayscale',
      )}
      animate={piece.isDying ? { opacity: 0, scale: 1.4 } : { opacity: piece.isDead ? 0.3 : 1, scale: isSelected ? 1.05 : 1 }}
      transition={piece.isDying
        ? { duration: 0.3, ease: 'easeOut' }
        : { type: 'spring', stiffness: 400, damping: 30 }
      }
    >
      <span className="text-xs font-bold leading-none">
        {def?.name.slice(0, 2) ?? '??'}
      </span>
      <span className="text-[10px] opacity-70">
        {piece.currentForce}/{piece.currentMass}
      </span>
      {piece.countdown && piece.countdown.currentTurns > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#854F0B] text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold">
          {piece.countdown.currentTurns}
        </span>
      )}
      {piece.isSealed && (
        <span className="absolute inset-0 flex items-center justify-center text-xl opacity-60">
          ✕
        </span>
      )}
    </motion.div>
  )
}
