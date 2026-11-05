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
  const heading = useRef<HTMLHeadingElement>(null);
  const load = () => { setError(""); readContent<Question[]>("questions/").then(setQuestions).catch(e => setError(e.message)); };
  useEffect(load, []);
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
      <button onClick={() => { setResult(undefined); setAnswers({}); setFeedback(undefined); setStep(0); }}>Repetir actividad</button>
    </section> : q && <section className="quiz-card" aria-label="Pregunta actual">
      <div className="quiz-meta"><span>Pregunta {step + 1} de {questions!.length}</span><span>{Object.keys(answers).length} respondidas</span></div>
      <progress value={Object.keys(answers).length} max={questions!.length} aria-label="Progreso de la actividad" />
      <h2 ref={heading} tabIndex={-1}>{q.prompt}</h2>
      <div className="quiz-options">{q.options.map((option, index) => <button key={q.id + "-" + index}
        className={"quiz-option " + (feedback && answers[q.id] === index ? feedback.correct ? "is-correct" : "is-incorrect" : "")}
        aria-pressed={answers[q.id] === index} aria-disabled={!!feedback} onClick={() => answer(index)}>
        <span className="option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option}</span>
      </button>)}</div>
      {feedback && <div className={"quiz-feedback " + (feedback.correct ? "correct" : "incorrect")} role="status"><strong>{feedback.correct ? "¡Respuesta correcta!" : "Esta vez no. La respuesta es: " + feedback.correct_answer}</strong><p>{feedback.explanation}</p></div>}
      <div className="quiz-actions"><button disabled={!feedback} onClick={() => {
        if (step < questions!.length - 1) { setStep(step + 1); setFeedback(undefined); }
        else { try { setResult(gradeQuiz(answers)); } catch(e) { setError((e as Error).message); } }
      }}>{step < questions!.length - 1 ? "Siguiente pregunta" : "Finalizar actividad"}</button></div>
    </section>}
  </div>;
}
