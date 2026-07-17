'use client';

import { useState, useTransition } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { techOptions } from '@/lib/tech-options';
import { CodeAwareText } from '@/components/CodeAwareText';
import {
  generateQuestion,
  generateFeedback,
  type GeneratedQuestion,
  type Feedback,
} from './actions';

type Phase = 'picker' | 'question' | 'feedback';

export function TechQuestionsClient() {
  const [techId, setTechId] = useState(techOptions[0].id);
  const [version, setVersion] = useState(techOptions[0].versions[0]);
  const [phase, setPhase] = useState<Phase>('picker');
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTech = techOptions.find((tech) => tech.id === techId) ?? techOptions[0];

  function handleTechChange(event: SelectChangeEvent) {
    const newTechId = event.target.value;
    const tech = techOptions.find((t) => t.id === newTechId) ?? techOptions[0];
    setTechId(newTechId);
    setVersion(tech.versions[0] ?? '');
  }

  function handleGenerateQuestion() {
    setError(null);
    startTransition(async () => {
      try {
        const q = await generateQuestion(techId, version);
        setQuestion(q);
        setAnswer('');
        setPhase('question');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate a question.');
      }
    });
  }

  function handleSubmitAnswer() {
    if (!question) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const fb = await generateFeedback(techId, version, question, answer);
        setFeedback(fb);
        setPhase('feedback');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate feedback.');
      }
    });
  }

  function handleReset() {
    setPhase('picker');
    setQuestion(null);
    setAnswer('');
    setFeedback(null);
    setError(null);
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tech Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Scenario-based questions — pick a technology and version, or go general.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {phase === 'picker' && (
        <Stack spacing={2} sx={{ maxWidth: 360 }}>
          <FormControl fullWidth>
            <InputLabel id="tech-label">Topic</InputLabel>
            <Select labelId="tech-label" label="Topic" value={techId} onChange={handleTechChange}>
              {techOptions.map((tech) => (
                <MenuItem key={tech.id} value={tech.id}>
                  {tech.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedTech.versions.length > 0 && (
            <FormControl fullWidth>
              <InputLabel id="version-label">Version</InputLabel>
              <Select
                labelId="version-label"
                label="Version"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
              >
                {selectedTech.versions.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button variant="contained" onClick={handleGenerateQuestion} disabled={isPending}>
            {isPending ? <CircularProgress size={20} /> : 'Generate question'}
          </Button>
        </Stack>
      )}

      {phase === 'question' && question && (
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {version ? `${selectedTech.label} ${version}` : selectedTech.label}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {question.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {question.scenario}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {question.question}
              </Typography>
            </CardContent>
          </Card>
          <TextField
            label="Your answer"
            multiline
            minRows={6}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleSubmitAnswer}
              disabled={isPending || answer.trim().length === 0}
            >
              {isPending ? <CircularProgress size={20} /> : 'Submit answer'}
            </Button>
            <Button variant="text" onClick={handleReset} disabled={isPending}>
              Start over
            </Button>
          </Stack>
        </Stack>
      )}

      {phase === 'feedback' && feedback && question && (
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {question.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {question.question}
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Correctness
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {feedback.correctness}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Communication
              </Typography>
              <Typography variant="body1">{feedback.communication}</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Model answer
              </Typography>
              <CodeAwareText text={feedback.modelAnswer} />
            </CardContent>
          </Card>
          <Button variant="contained" onClick={handleReset}>
            Try another question
          </Button>
        </Stack>
      )}
    </Container>
  );
}
