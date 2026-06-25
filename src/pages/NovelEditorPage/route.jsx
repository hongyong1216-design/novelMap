import { Navigate } from 'react-router-dom'
import NovelEditorPage from './index'
import contentRoute from './subpages/ContentEditor/route'
import itemRoute from './subpages/ItemLexicon/route'
import backgroundRoute from './subpages/StoryBackground/route'
import mapRoute from './subpages/MapEditor/route'
import factionRoute from './subpages/FactionEditor/route'
import characterRoute from './subpages/CharacterProfile/route'
import storylineRoute from './subpages/StorylineEditor/route'
import abilityRoute from './subpages/AbilityTree/route'

export default {
  path: '/editor/:novelId',
  element: <NovelEditorPage />,
  children: [
    { index: true, element: <Navigate to="content" replace /> },
    contentRoute,
    itemRoute,
    backgroundRoute,
    mapRoute,
    factionRoute,
    characterRoute,
    storylineRoute,
    abilityRoute,
  ],
}
