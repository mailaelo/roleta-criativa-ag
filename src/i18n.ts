import i18next from 'i18next';

export async function initI18n() {
  await i18next.init({
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    resources: {
      'pt-BR': {
        translation: {
          appTitle: 'Roleta Criativa',
          appSubtitle: 'Deixe a aleatoriedade inspirar sua próxima obra-prima',
          connectDrive: 'Conecte seu Drive',
          connectDriveDesc: 'Cole um link público de pasta do Google Drive contendo imagens ou vídeos.',
          generateWheel: 'Gerar Roleta',
          spinWheel: 'GIRAR A ROLETA',
          yourSelection: 'Sua Seleção',
          startSession: 'Iniciar Sessão',
          stopSession: 'Parar Sessão',
          pauseSession: 'Pausar',
          resumeSession: 'Retomar',
          sessionComplete: 'Sessão Concluída!',
          reflectionDesc: 'Tire um momento para refletir sobre seu progresso no Hábito Criativo.',
          practicedQuestion: '1. Você praticou suas habilidades de arte hoje?',
          yes: 'Sim',
          no: 'Não',
          tagsQuestion: '2. Quais temas/habilidades você praticou? (Separe as tags por vírgula)',
          tagsPlaceholder: 'ex: anatomia, cores, sombreamento...',
          moodQuestion: '3. Como você se sente após a sessão?',
          saveAndAnalytics: 'Salvar & Ver Painel',
          creativeJourney: 'Sua Jornada Criativa',
          journeyDesc: 'Um olhar retrospectivo sobre seus hábitos de estudo',
          totalSessions: 'Total de Sessões',
          longestStreak: 'Maior Ofensiva',
          currentStreak: 'Ofensiva Atual',
          activeTags: 'Tags Ativas',
          date: 'Data',
          media: 'Mídia',
          time: 'Tempo',
          mood: 'Humor',
          tags: 'Tags',
          practiced: 'Praticou?',
          startNewSession: 'Iniciar Nova Sessão',
          hobbieMode: 'Modo Hobbie',
          hobbieDesc: 'Zero rastros. Seus dados são apagados ao fechar a aba.',
          estudoMode: 'Modo Estudo',
          estudoDesc: 'Sessão persistente. Acompanhe seu progresso e histórico.',
          emailPlaceholder: 'Seu email',
          loginEmail: 'Entrar com Email',
          checkEmail: 'Verifique seu email para o link de login!',
          logout: 'Sair',
          accessibility: 'Acessibilidade',
          contrast: 'Contraste',
          typography: 'Tipografia',
          letterSpacing: 'Espaçamento',
          fontScaling: 'Tamanho da Fonte',
          mediaVisibility: 'Visibilidade da Mídia',
        }
      }
    }
  });
}

export function t(key: string): string {
  return i18next.t(key);
}
