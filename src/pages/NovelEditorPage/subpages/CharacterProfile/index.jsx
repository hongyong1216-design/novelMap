import { useMemo } from 'react'
import { message } from 'antd'
import ProfileHeader from './components/ProfileHeader/ProfileHeader'
import FactionSection from './components/FactionSection/FactionSection'
import HelpFab from './components/HelpFab/HelpFab'
import { factions, characters } from './data/characters'
import './CharacterProfile.css'

export default function CharacterProfile() {
  const grouped = useMemo(() => {
    const map = new Map(factions.map((f) => [f.id, []]))
    characters.forEach((c) => {
      if (map.has(c.factionId)) map.get(c.factionId).push(c)
    })
    return factions
      .map((f) => ({ faction: f, members: map.get(f.id) || [] }))
      .filter((g) => g.members.length > 0)
  }, [])

  const handleCreate = () => {
    message.info('新建档案功能即将上线')
  }

  const handleFilter = () => {
    message.info('筛选功能即将上线')
  }

  const handleSelect = (character) => {
    message.info(`已选中: ${character.name}`)
  }

  return (
    <div className="character-profile">
      <div className="character-profile__container">
        <ProfileHeader
          onCreate={handleCreate}
          onFilter={handleFilter}
        />

        {grouped.map(({ faction, members }) => (
          <FactionSection
            key={faction.id}
            faction={faction}
            characters={members}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <HelpFab onClick={() => message.info('帮助文档建设中')} />
    </div>
  )
}
