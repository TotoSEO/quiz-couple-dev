import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import '@/i18n/config';
import { ScrollToTop } from "./components/layout/ScrollToTop";

// Lazy-load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const TesterSonCouple = lazy(() => import("./pages/TesterSonCouple"));
const TestPointsCommuns = lazy(() => import("./pages/TestPointsCommuns"));
const QuizAmoureux = lazy(() => import("./pages/QuizAmoureux"));
const QuizCoquin = lazy(() => import("./pages/QuizCoquin"));
const QuizMarrant = lazy(() => import("./pages/QuizMarrant"));
const QuizDistance = lazy(() => import("./pages/QuizDistance"));
const TestCoupleToxique = lazy(() => import("./pages/TestCoupleToxique"));
const TestCoupleSain = lazy(() => import("./pages/TestCoupleSain"));
const TestCoupleMariage = lazy(() => import("./pages/TestCoupleMariage"));
const TestDivorce = lazy(() => import("./pages/TestDivorce"));
const QuizQuiConnait = lazy(() => import("./pages/QuizQuiConnait"));
const QuizQuiEstLePlus = lazy(() => import("./pages/QuizQuiEstLePlus"));
const QuestionsCouple = lazy(() => import("./pages/QuestionsCouple"));
const ResoudreProblemeCouple = lazy(() => import("./pages/ResoudreProblemeCouple"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const QuizCoupleAdo = lazy(() => import("./pages/QuizCoupleAdo"));

const queryClient = new QueryClient();

// Define all routes for each language
const RoutesConfig = () => (
  <Suspense fallback={null}>
    <Routes>
      {/* French Routes (default) */}
      <Route path="/" element={<Index />} />
      <Route path="/tester-son-couple" element={<TesterSonCouple />} />
      <Route path="/test-points-communs-couples" element={<TestPointsCommuns />} />
      <Route path="/quiz-amoureux" element={<QuizAmoureux />} />
      <Route path="/quiz-couple-coquin" element={<QuizCoquin />} />
      <Route path="/quiz-couple-marrant" element={<QuizMarrant />} />
      <Route path="/quiz-couple-distance" element={<QuizDistance />} />
      <Route path="/test-couple-toxique" element={<TestCoupleToxique />} />
      <Route path="/test-couple-sain" element={<TestCoupleSain />} />
      <Route path="/test-couple-mariage" element={<TestCoupleMariage />} />
      <Route path="/quiz-qui-connait-mieux-partenaire" element={<QuizQuiConnait />} />
      <Route path="/test-dois-je-divorcer" element={<TestDivorce />} />
      <Route path="/quiz-qui-est-le-plus" element={<QuizQuiEstLePlus />} />
      <Route path="/questions-couple" element={<QuestionsCouple />} />
      <Route path="/resoudre-probleme-couple" element={<ResoudreProblemeCouple />} />
      <Route path="/mentions-legales" element={<MentionsLegales />} />
      <Route path="/confidentialite" element={<Confidentialite />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/quiz-couple-ado" element={<QuizCoupleAdo />} />
      
      {/* English Routes */}
      <Route path="/en" element={<Index />} />
      <Route path="/en/couple-compatibility-test" element={<TesterSonCouple />} />
      <Route path="/en/couple-common-points-test" element={<TestPointsCommuns />} />
      <Route path="/en/love-quiz" element={<QuizAmoureux />} />
      <Route path="/en/spicy-couple-quiz" element={<QuizCoquin />} />
      <Route path="/en/funny-couple-quiz" element={<QuizMarrant />} />
      <Route path="/en/long-distance-relationship-quiz" element={<QuizDistance />} />
      <Route path="/en/toxic-relationship-test" element={<TestCoupleToxique />} />
      <Route path="/en/healthy-relationship-test" element={<TestCoupleSain />} />
      <Route path="/en/marriage-compatibility-test" element={<TestCoupleMariage />} />
      <Route path="/en/who-knows-partner-best-quiz" element={<QuizQuiConnait />} />
      <Route path="/en/should-i-divorce-test" element={<TestDivorce />} />
      <Route path="/en/who-is-most-likely-quiz" element={<QuizQuiEstLePlus />} />
      <Route path="/en/couple-questions" element={<QuestionsCouple />} />
      <Route path="/en/solve-couple-problem" element={<ResoudreProblemeCouple />} />
      <Route path="/en/legal-notice" element={<MentionsLegales />} />
      <Route path="/en/privacy-policy" element={<Confidentialite />} />
      <Route path="/en/blog" element={<Blog />} />
      <Route path="/en/blog/:slug" element={<BlogPost />} />
      <Route path="/en/teen-couple-quiz" element={<QuizCoupleAdo />} />
      
      {/* Spanish Routes */}
      <Route path="/es" element={<Index />} />
      <Route path="/es/test-compatibilidad-pareja" element={<TesterSonCouple />} />
      <Route path="/es/test-puntos-comunes-pareja" element={<TestPointsCommuns />} />
      <Route path="/es/quiz-enamorados" element={<QuizAmoureux />} />
      <Route path="/es/quiz-pareja-picante" element={<QuizCoquin />} />
      <Route path="/es/quiz-pareja-divertido" element={<QuizMarrant />} />
      <Route path="/es/quiz-pareja-distancia" element={<QuizDistance />} />
      <Route path="/es/test-relacion-toxica" element={<TestCoupleToxique />} />
      <Route path="/es/test-relacion-sana" element={<TestCoupleSain />} />
      <Route path="/es/test-compatibilidad-matrimonio" element={<TestCoupleMariage />} />
      <Route path="/es/quiz-quien-conoce-mejor-pareja" element={<QuizQuiConnait />} />
      <Route path="/es/test-debo-divorciarme" element={<TestDivorce />} />
      <Route path="/es/quiz-quien-es-mas" element={<QuizQuiEstLePlus />} />
      <Route path="/es/preguntas-pareja" element={<QuestionsCouple />} />
      <Route path="/es/resolver-problema-pareja" element={<ResoudreProblemeCouple />} />
      <Route path="/es/aviso-legal" element={<MentionsLegales />} />
      <Route path="/es/politica-privacidad" element={<Confidentialite />} />
      <Route path="/es/blog" element={<Blog />} />
      <Route path="/es/blog/:slug" element={<BlogPost />} />
      <Route path="/es/quiz-pareja-adolescentes" element={<QuizCoupleAdo />} />
      
      {/* German Routes */}
      <Route path="/de" element={<Index />} />
      <Route path="/de/paar-kompatibilitaetstest" element={<TesterSonCouple />} />
      <Route path="/de/gemeinsamkeiten-test-paare" element={<TestPointsCommuns />} />
      <Route path="/de/liebes-quiz" element={<QuizAmoureux />} />
      <Route path="/de/pikantes-paar-quiz" element={<QuizCoquin />} />
      <Route path="/de/lustiges-paar-quiz" element={<QuizMarrant />} />
      <Route path="/de/fernbeziehung-quiz" element={<QuizDistance />} />
      <Route path="/de/toxische-beziehung-test" element={<TestCoupleToxique />} />
      <Route path="/de/gesunde-beziehung-test" element={<TestCoupleSain />} />
      <Route path="/de/ehe-kompatibilitaetstest" element={<TestCoupleMariage />} />
      <Route path="/de/wer-kennt-partner-besser-quiz" element={<QuizQuiConnait />} />
      <Route path="/de/scheidungstest" element={<TestDivorce />} />
      <Route path="/de/wer-ist-am-meisten-quiz" element={<QuizQuiEstLePlus />} />
      <Route path="/de/fragen-fuer-paare" element={<QuestionsCouple />} />
      <Route path="/de/paar-problem-loesen" element={<ResoudreProblemeCouple />} />
      <Route path="/de/impressum" element={<MentionsLegales />} />
      <Route path="/de/datenschutz" element={<Confidentialite />} />
      <Route path="/de/blog" element={<Blog />} />
      <Route path="/de/blog/:slug" element={<BlogPost />} />
      <Route path="/de/teenager-paar-quiz" element={<QuizCoupleAdo />} />
      
      {/* Italian Routes */}
      <Route path="/it" element={<Index />} />
      <Route path="/it/test-compatibilita-coppia" element={<TesterSonCouple />} />
      <Route path="/it/test-punti-comuni-coppia" element={<TestPointsCommuns />} />
      <Route path="/it/quiz-innamorati" element={<QuizAmoureux />} />
      <Route path="/it/quiz-coppia-piccante" element={<QuizCoquin />} />
      <Route path="/it/quiz-coppia-divertente" element={<QuizMarrant />} />
      <Route path="/it/quiz-coppia-distanza" element={<QuizDistance />} />
      <Route path="/it/test-relazione-tossica" element={<TestCoupleToxique />} />
      <Route path="/it/test-relazione-sana" element={<TestCoupleSain />} />
      <Route path="/it/test-compatibilita-matrimonio" element={<TestCoupleMariage />} />
      <Route path="/it/quiz-chi-conosce-meglio-partner" element={<QuizQuiConnait />} />
      <Route path="/it/test-devo-divorziare" element={<TestDivorce />} />
      <Route path="/it/quiz-chi-e-piu" element={<QuizQuiEstLePlus />} />
      <Route path="/it/domande-coppia" element={<QuestionsCouple />} />
      <Route path="/it/risolvere-problema-coppia" element={<ResoudreProblemeCouple />} />
      <Route path="/it/note-legali" element={<MentionsLegales />} />
      <Route path="/it/privacy" element={<Confidentialite />} />
      <Route path="/it/blog" element={<Blog />} />
      <Route path="/it/blog/:slug" element={<BlogPost />} />
      <Route path="/it/quiz-coppia-adolescenti" element={<QuizCoupleAdo />} />
      
      {/* Admin & 404 */}
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RoutesConfig />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
