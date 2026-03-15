import { useUIStore } from '@/stores/uiStore'
import { MainMenu } from '@/screens/MainMenu'
import { PiecePick } from '@/screens/PiecePick'
import { RunMapScreen } from '@/screens/RunMapScreen'
import { FormationSetup } from '@/screens/FormationSetup'
import { Battle } from '@/screens/Battle'
import { Reward } from '@/screens/Reward'
import { RunEnd } from '@/screens/RunEnd'
import { EventModal } from '@/components/modals/EventModal'
import { ShopModal } from '@/components/modals/ShopModal'

export default function App() {
  const { currentScreen, modalOpen } = useUIStore()

  const screens = {
    main_menu: <MainMenu />,
    piece_pick: <PiecePick />,
    run_map: <RunMapScreen />,
    formation_setup: <FormationSetup />,
    battle: <Battle />,
    reward: <Reward />,
    shop: <RunMapScreen />, // shop은 모달로 처리
    event: <RunMapScreen />, // event는 모달로 처리
    run_end: <RunEnd />,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {screens[currentScreen as keyof typeof screens] ?? <MainMenu />}

      {/* 모달들 */}
      {modalOpen === 'event' && <EventModal />}
      {modalOpen === 'shop' && <ShopModal />}
    </div>
  )
}
