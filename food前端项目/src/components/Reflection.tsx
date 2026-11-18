import SkyCelestial from './SkyCelestial'
import type { Theme } from '../types'
import s from './Reflection.module.css'

export default function Reflection({ theme }: { theme: Theme }) {
  return (
    <div className={s.root} aria-hidden="true">
      <div className={s.mirror}>
        <SkyCelestial theme={theme} mirror />
        <div className={s.stars} />
      </div>
    </div>
  )
}
