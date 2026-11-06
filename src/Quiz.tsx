import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gradeQuestion, gradeQuiz, readContent } from "./content";
import type { Question } from "./types";

export function Quiz() {
  const [questions, setQuestions] = useState<Question[]>();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<ReturnType<typeof gradeQuestion>>();
  const [result, setResult] = useState<ReturnType<typeof gradeQuiz>>();
  const [error, setError] = useState("");
  const [choice, setChoice] = useState<number>();
  const heading = useRef<HTMLHeadingElement>(null);
  const load = () => { setError(""); readContent<Question[]>("questions/").then(items => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("leon-quiz-progress") || "null");
      if (saved?.signature === JSON.stringify(items) && Number.isInteger(saved.step) && saved.step >= 0 && saved.step < items.length) {
        const validAnswers: Record<string, number> = {};
        for (const item of items) if (saved.answers?.[item.id] !== undefined) {
          gradeQuestion(item.id, saved.answers[item.id]);
          validAnswers[item.id] = saved.answers[item.id];
        }
        // Only restore a contiguous completed prefix, never skip an unanswered question.
        if (items.slice(0, saved.step).every(item => validAnswers[item.id] !== undefined)) {
          setAnswers(validAnswers); setStep(saved.step);
          const answer = validAnswers[items[saved.step].id];
          if (answer !== undefined) { setChoice(answer); setFeedback(gradeQuestion(items[saved.step].id, answer)); }
          else if (Number.isInteger(saved.choice) && saved.choice >= 0 && saved.choice < items[saved.step].options.length) setChoice(saved.choice);
          if (saved.finished && Object.keys(validAnswers).length === items.length) setResult(gradeQuiz(validAnswers));
        }
      }
    } catch { /* Unavailable or stale session data must not block the activity. */ }
    setQuestions(items);
  }).catch(e => setError(e.message)); };
  useEffect(load, []);
  useEffect(() => {
    if (!questions) return;
    try { sessionStorage.setItem("leon-quiz-progress", JSON.stringify({ signature: JSON.stringify(questions), answers, step, choice, finished: !!result })); } catch { /* Continue without persistence. */ }
  }, [questions, answers, step, choice, result]);
  useEffect(() => { if (step || result) heading.current?.focus(); }, [step, result]);
  const q = questions?.[step];
  function answer(index: number) {
    if (!q || feedback) return;
    try {
      const review = gradeQuestion(q.id, index);
      setAnswers(a => ({ ...a, [q!.id]: index }));
      setFeedback(review);
      if (!review.correct && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) navigator.vibrate?.(60);
    } catch (e) { setError((e as Error).message); }
  }
  return <div className="quiz-layout">
    <div className="page-title"><h1>Pon a prueba tu recorrido</h1><p>Una pregunta, un descubrimiento. Comprueba lo que aprendiste sobre León y consulta sus fuentes.</p></div>
    {error && <p role="alert">{error} <button onClick={load}>Reintentar</button></p>}
    {!questions && !error && <p role="status">Cargando preguntas…</p>}
    {questions && !questions.length && <div className="notice"><p>No hay preguntas disponibles en este catálogo.</p><button disabled>Finalizar actividad</button></div>}
    {result ? <section className="quiz-result" aria-live="polite">
      <p className="result-number">{result.score}<span> / {result.total}</span></p>
      <h2 ref={heading} tabIndex={-1}>Resultado: {result.score} de {result.total}</h2>
      {result.results.map(x => <div className="claim" key={x.id}><strong>{x.correct ? "Respuesta correcta" : "Para seguir aprendiendo"}: {x.correct_answer}</strong><p>{x.explanation}</p><Link to={"/lugares/" + x.place_slug}>Consultar la ficha</Link></div>)}
      <p className="achievement">Recorrido de aprendizaje completado</p>
      <div className="actions"><Link className="button" to="/explorar">Volver al mapa</Link>
      <button className="secondary" onClick={() => { setResult(undefined); setAnswers({}); setFeedback(undefined); setChoice(undefined); setStep(0); }}>Repetir actividad</button></div>
    </section> : q && <section className="quiz-card" aria-label="Pregunta actual">
      <div className="quiz-meta"><span>Pregunta {step + 1} de {questions!.length}</span><span>{Object.keys(answers).length} respondidas</span></div>
      <progress value={Object.keys(answers).length} max={questions!.length} aria-label="Progreso de la actividad" />
      <h2 ref={heading} tabIndex={-1}>{q.prompt}</h2>
      <div className="quiz-options">{q.options.map((option, index) => <button key={q.id + "-" + index}
        className={"quiz-option " + (feedback && answers[q.id] === index ? feedback.correct ? "is-correct" : "is-incorrect" : choice === index ? "is-selected" : "")}
        aria-pressed={choice === index} aria-disabled={!!feedback} onClick={() => { if (!feedback) setChoice(index); }}>
        <span className="option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option}</span>
      </button>)}</div>
      {feedback && <div className={"quiz-feedback " + (feedback.correct ? "correct" : "incorrect")} role="status"><strong>{feedback.correct ? "¡Respuesta correcta!" : "Esta vez no. La respuesta es: " + feedback.correct_answer}</strong><p>{feedback.explanation}</p></div>}
      <div className="quiz-actions">{!feedback ? <button disabled={choice === undefined} onClick={() => { if (choice !== undefined) answer(choice); }}>Comprobar respuesta</button> : <button onClick={() => {
        if (step < questions!.length - 1) { setStep(step + 1); setFeedback(undefined); setChoice(undefined); }
        else { try { setResult(gradeQuiz(answers)); } catch(e) { setError((e as Error).message); } }
      }}>{step < questions!.length - 1 ? "Siguiente pregunta" : "Finalizar actividad"}</button>}</div>
    </section>}
  </div>;
}
