import React, { useState, useEffect } from 'react';
import { Trophy, Share2, RotateCcw, Clock } from 'lucide-react';

// NFL MVP data from 1960s onwards
const NFL_MVPS = {
  1960: "Abner Haynes",
  1961: "George Blanda",
  1962: "Jim Taylor",
  1963: "Y.A. Tittle",
  1964: "Johnny Unitas",
  1965: "Jim Brown",
  1966: "Bart Starr",
  1967: "Johnny Unitas",
  1968: "Earl Morrall",
  1969: "Roman Gabriel",
  1970: "John Brodie",
  1971: "Alan Page",
  1972: "Larry Brown",
  1973: "O.J. Simpson",
  1974: "Ken Stabler",
  1975: "Fran Tarkenton",
  1976: "Bert Jones",
  1977: "Walter Payton",
  1978: "Terry Bradshaw",
  1979: "Earl Campbell",
  1980: "Brian Sipe",
  1981: "Ken Anderson",
  1982: "Mark Moseley",
  1983: "Joe Theismann",
  1984: "Dan Marino",
  1985: "Marcus Allen",
  1986: "Lawrence Taylor",
  1987: "John Elway",
  1988: "Boomer Esiason",
  1989: "Joe Montana",
  1990: "Joe Montana",
  1991: "Thurman Thomas",
  1992: "Steve Young",
  1993: "Emmitt Smith",
  1994: "Steve Young",
  1995: "Brett Favre",
  1996: "Brett Favre",
  1997: "Barry Sanders",
  1998: "Terrell Davis",
  1999: "Kurt Warner",
  2000: "Marshall Faulk",
  2001: "Kurt Warner",
  2002: "Rich Gannon",
  2003: "Peyton Manning",
  2004: "Peyton Manning",
  2005: "Shaun Alexander",
  2006: "LaDainian Tomlinson",
  2007: "Tom Brady",
  2008: "Peyton Manning",
  2009: "Peyton Manning",
  2010: "Tom Brady",
  2011: "Aaron Rodgers",
  2012: "Adrian Peterson",
  2013: "Peyton Manning",
  2014: "Aaron Rodgers",
  2015: "Cam Newton",
  2016: "Matt Ryan",
  2017: "Tom Brady",
  2018: "Patrick Mahomes",
  2019: "Lamar Jackson",
  2020: "Aaron Rodgers",
  2021: "Aaron Rodgers",
  2022: "Patrick Mahomes",
  2023: "Lamar Jackson",
  2024: "Josh Allen"
};

const App = () => {
  const [gameState, setGameState] = useState('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [bestScore, setBestScore] = useState(0);
  const [todayPlayed, setTodayPlayed] = useState(false);
  const [todayScore, setTodayScore] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [answerHistory, setAnswerHistory] = useState([]);

  useEffect(() => {
    loadGameData();
  }, []);

  useEffect(() => {
    // Auto-start game if user hasn't played today
    if (!todayPlayed && gameState === 'start') {
      const selectedYears = getTodayQuestions();
      setQuestions(selectedYears);
      setGameState('playing');
    }
  }, [todayPlayed, gameState]);

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const seededRandom = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const getTodayQuestions = () => {
    const dateString = getTodayDate();
    const seed = dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    const years = Object.keys(NFL_MVPS);
    const shuffled = [...years];
    
    // Fisher-Yates shuffle with seeded random
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, 10);
  };

  const loadGameData = async () => {
    try {
      const bestResult = await window.storage.get('nfl_mvp_best_score');
      if (bestResult && bestResult.value) {
        setBestScore(parseInt(bestResult.value));
      }

      const todayDate = getTodayDate();
      const lastPlayedResult = await window.storage.get('nfl_mvp_last_played');
      
      if (lastPlayedResult && lastPlayedResult.value === todayDate) {
        setTodayPlayed(true);
        const scoreResult = await window.storage.get('nfl_mvp_today_score');
        if (scoreResult && scoreResult.value) {
          setTodayScore(parseInt(scoreResult.value));
        }
        
        // Load answer history for display
        try {
          const historyResult = await window.storage.get('nfl_mvp_today_history');
          if (historyResult && historyResult.value) {
            setAnswerHistory(JSON.parse(historyResult.value));
          }
        } catch (e) {
          console.log('No history found');
        }
      }
    } catch (error) {
      console.log('No previous game data');
    }
  };

  const saveBestScore = async (newScore) => {
    try {
      await window.storage.set('nfl_mvp_best_score', newScore.toString());
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const saveTodayScore = async (finalScore, history) => {
    try {
      const todayDate = getTodayDate();
      await window.storage.set('nfl_mvp_last_played', todayDate);
      await window.storage.set('nfl_mvp_today_score', finalScore.toString());
      await window.storage.set('nfl_mvp_today_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving today score:', error);
    }
  };

  const startGame = () => {
    if (todayPlayed) {
      return;
    }

    const selectedYears = getTodayQuestions();
    
    setQuestions(selectedYears);
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswer('');
    setFeedback('');
    setAnswerHistory([]);
    setGameState('playing');
  };

  const normalizeName = (name) => {
    return name.toLowerCase().trim().replace(/[^a-z\s]/g, '');
  };

  const checkAnswer = () => {
    const year = questions[currentQuestion];
    const correctAnswer = NFL_MVPS[year];
    const normalizedCorrect = normalizeName(correctAnswer);
    const normalizedUser = normalizeName(userAnswer);
    
    const lastName = normalizedCorrect.split(' ').pop();
    
    const isCorrect = normalizedUser === normalizedCorrect || 
                      normalizedUser === lastName ||
                      normalizedCorrect.includes(normalizedUser);
    
    const newAnswerHistory = [...answerHistory, {
      year,
      correct: isCorrect,
      answer: correctAnswer
    }];
    setAnswerHistory(newAnswerHistory);
    
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setFeedback(`✓ Correct! ${correctAnswer}`);
      
      setTimeout(() => {
        if (currentQuestion + 1 < questions.length) {
          setCurrentQuestion(currentQuestion + 1);
          setUserAnswer('');
          setFeedback('');
        } else {
          endGame(newScore);
        }
      }, 1500);
    } else {
      endGame(score);
      setFeedback(`✗ Incorrect. The answer was ${correctAnswer}`);
    }
  };

  const endGame = async (finalScore) => {
    setGameState('ended');
    setTodayScore(finalScore);
    setTodayPlayed(true);
    await saveTodayScore(finalScore, answerHistory);
    
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      await saveBestScore(finalScore);
    }
  };

  const shareResults = async () => {
    const getTodayDateString = () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      const year = today.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const emojiGrid = answerHistory.map(item => item.correct ? '🟩' : '🟥').join('');
    
    const text = `NFL MVP Challenge ${getTodayDateString()}
${score}/10

${emojiGrid}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setShareMessage('Copied to clipboard!');
      setTimeout(() => setShareMessage(''), 2000);
    } catch (error) {
      console.log('Copy failed:', error);
      setShareMessage('Unable to copy');
      setTimeout(() => setShareMessage(''), 2000);
    }
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (todayPlayed && (gameState === 'start' || gameState === 'ended')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Clock className="w-20 h-20 mx-auto mb-4 text-blue-500" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Today's Game Complete!</h1>
          <p className="text-gray-600 mb-6">
            You've completed today's challenge. Come back tomorrow for a new set of questions!
          </p>
          
          <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-6 mb-6">
            <div className="text-5xl font-bold text-gray-800 mb-2">{todayScore}/10</div>
            <div className="text-gray-600">Today's Score</div>
          </div>

          {todayScore === 10 && (
            <div className="bg-yellow-100 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-bold text-xl">🎉 Perfect Score! 🎉</p>
            </div>
          )}

          {bestScore > 0 && (
            <div className="text-gray-600 mb-6">
              Best Score: {bestScore}/10
            </div>
          )}

          {answerHistory.length > 0 && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Answers</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {answerHistory.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-lg border-2 text-sm ${
                      item.correct 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">
                          {index + 1}.
                        </span>
                        <span className="font-semibold text-gray-800">{item.year}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">{item.answer}</span>
                        <span>
                          {item.correct ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 font-semibold">Next game in:</p>
            <p className="text-2xl font-bold text-blue-600">{getTimeUntilMidnight()}</p>
          </div>

          <button
            onClick={shareResults}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 mb-4"
          >
            <Share2 className="w-5 h-5" />
            Share Results
          </button>

          {shareMessage && (
            <div className="bg-green-100 text-green-800 py-2 px-4 rounded-lg font-semibold">
              {shareMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-pulse">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <p className="text-gray-600">Loading today's challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const year = questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">NFL MVP Challenge</h1>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-semibold text-gray-600">
              Question {currentQuestion + 1}/10
            </div>
            <div className="text-sm font-semibold text-green-600">
              Score: {score}
            </div>
          </div>
          
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-6xl font-bold text-gray-800 mb-4">{year}</h2>
            <p className="text-xl text-gray-600">Who was the NFL MVP?</p>
          </div>

          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && userAnswer.trim() && !feedback && checkAnswer()}
            placeholder="Enter player's last name"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg mb-4 focus:outline-none focus:border-blue-500"
            autoFocus
            disabled={feedback !== ''}
          />

          {feedback && (
            <div className={`p-4 rounded-lg mb-4 text-center font-semibold ${
              feedback.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {feedback}
            </div>
          )}

          {!feedback && (
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg text-lg font-bold hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              Submit Answer
            </button>
          )}

          {answerHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 text-center">Progress Ladder</h3>
              <div className="space-y-2">
                {answerHistory.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      item.correct 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">
                          {index + 1}.
                        </span>
                        <span className="font-semibold text-gray-800">{item.year}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{item.answer}</span>
                        <span className="text-lg">
                          {item.correct ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    // This state is now handled by the todayPlayed check above
    // Redirect to the completed state
    if (!todayPlayed) {
      setTodayPlayed(true);
    }
    return null;
  }
};

export default App;