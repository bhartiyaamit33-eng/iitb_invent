import { PRACTICE_WORDS, RESEARCH_WORDS } from "@/lib/site";

export function TwoWorlds() {
  return (
    <div className="two-worlds">
      <div className="two-worlds-col is-practice">
        <p className="site-kicker is-blue">Venture practice</p>
        <ul>
          {PRACTICE_WORDS.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </div>
      <div className="two-worlds-center">
        <span className="two-worlds-line" aria-hidden="true" />
        <span className="intersect-core pulse" aria-hidden="true" />
        <p>
          IITB
          <br />
          INV.ENT
        </p>
        <span className="two-worlds-line" aria-hidden="true" />
      </div>
      <div className="two-worlds-col is-research">
        <p className="site-kicker">Entrepreneurship research</p>
        <ul>
          {RESEARCH_WORDS.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
