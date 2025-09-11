import { useResponsiveHeader } from '@hooks/useResponsiveHeader';
import Header from '@components/Header/Header';

export default function ResponsiveHeader() {
  const headerConfig = useResponsiveHeader();

  if (!headerConfig.visible) {
    return null;
  }

  return (
    <Header
      title={headerConfig.title}
      leftButtonIcon={headerConfig.leftButtonIcon}
      rightButtonIcon={headerConfig.rightButtonIcon}
      topContent={headerConfig.topContent}
      profile={headerConfig.profile}
      segmentControl={headerConfig.segmentControl}
      showWeekController={headerConfig.showWeekController}
    />
  );
}
