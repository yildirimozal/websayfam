'use client';

import React from 'react';
import { 
  Box, 
  ToggleButtonGroup, 
  ToggleButton, 
  useTheme as useMuiTheme,
  styled,
  Tooltip,
  Paper,
  Zoom
} from '@mui/material';
import { 
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  School as ClassicIcon
} from '@mui/icons-material';
import { useTheme } from '../theme/ThemeContext';

const ThemeContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  padding: '8px',
  borderRadius: '20px',
  backdropFilter: 'blur(20px)',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  boxShadow: theme.shadows[8],
  zIndex: 1000,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
  },
  '@media (max-width: 600px)': {
    bottom: '1rem',
    right: '1rem',
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  gap: '8px',
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    minWidth: '48px',
    color: theme.palette.text.secondary,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      transform: 'scale(1.1)',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'translateY(-2px)',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
      transition: 'transform 0.2s ease',
    },
    '&:hover .MuiSvgIcon-root': {
      transform: 'rotate(10deg)',
    },
  },
}));

// Wrap ToggleButton with Tooltip
const TooltipToggleButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    'aria-label': string;
    tooltipTitle: string;
    icon: React.ReactNode;
  }
>((props, ref) => (
  <Tooltip 
    title={props.tooltipTitle} 
    arrow 
    placement="top" 
    TransitionComponent={Zoom}
    enterDelay={200}
    leaveDelay={0}
  >
    <ToggleButton
      ref={ref}
      value={props.value}
      aria-label={props['aria-label']}
    >
      {props.icon}
    </ToggleButton>
  </Tooltip>
));

TooltipToggleButton.displayName = 'TooltipToggleButton';

const ThemeSwitcher = () => {
  const { currentTheme, setTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTheme: string | null
  ) => {
    if (newTheme !== null) {
      setTheme(newTheme as 'classic' | 'modernDark' | 'professionalLight');
    }
  };

  return (
    <ThemeContainer elevation={6}>
      <StyledToggleButtonGroup
        value={currentTheme}
        exclusive
        onChange={handleThemeChange}
        aria-label="tema seçici"
      >
        <TooltipToggleButton
          value="classic"
          aria-label="klasik tema"
          tooltipTitle="Klasik Tema"
          icon={<ClassicIcon />}
        />
        <TooltipToggleButton
          value="modernDark"
          aria-label="modern koyu tema"
          tooltipTitle="Modern Koyu Tema"
          icon={<DarkIcon />}
        />
        <TooltipToggleButton
          value="professionalLight"
          aria-label="profesyonel açık tema"
          tooltipTitle="Profesyonel Açık Tema"
          icon={<LightIcon />}
        />
      </StyledToggleButtonGroup>
    </ThemeContainer>
  );
};

export default ThemeSwitcher;
