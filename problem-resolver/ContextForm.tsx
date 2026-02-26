import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, Users, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Person, Gender, ProblemContext } from '@/types/problem-resolver';
import { useLanguage } from '@/hooks/useLanguage';

interface ContextFormProps {
  onSubmit: (context: ProblemContext) => void;
}

const defaultPerson = (): Person => ({
  name: '',
  gender: 'homme',
});

// Couleurs basées sur le genre sélectionné
const getGenderColors = (gender: Gender) => {
  if (gender === 'homme') {
    return {
      gradient: 'from-blue-500 to-indigo-500',
      background: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15',
    };
  }
  return {
    gradient: 'from-rose-500 to-pink-500',
    background: 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15',
  };
};

export function ContextForm({ onSubmit }: ContextFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [persons, setPersons] = useState<Person[]>([defaultPerson(), defaultPerson()]);
  const [context, setContext] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPerson = () => {
    if (persons.length < 4) {
      setPersons([...persons, defaultPerson()]);
    }
  };

  const removePerson = (index: number) => {
    if (persons.length > 2) {
      setPersons(persons.filter((_, i) => i !== index));
    }
  };

  const updatePerson = (index: number, field: keyof Person, value: string) => {
    const updated = [...persons];
    updated[index] = { ...updated[index], [field]: value };
    setPersons(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.length > 80) {
      newErrors.title = t('quizGames:problemResolver.titleError');
    }

    persons.forEach((person, index) => {
      if (!person.name.trim() || person.name.length > 30) {
        newErrors[`person_${index}`] = t('quizGames:problemResolver.nameError');
      }
    });

    if (!context.trim() || context.length > 300) {
      newErrors.context = t('quizGames:problemResolver.contextError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title: title.trim(),
        persons: persons.map(p => ({ ...p, name: p.name.trim() })),
        context: context.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Titre avec icône */}
      <div className="space-y-3">
        <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {t('quizGames:problemResolver.problemTitle')}
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('quizGames:problemResolver.problemTitlePlaceholder')}
          maxLength={80}
          className="text-base h-12"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{errors.title && <span className="text-destructive">{errors.title}</span>}</span>
          <span className={title.length > 70 ? 'text-amber-500 font-medium' : ''}>{title.length}/80</span>
        </div>
      </div>

      {/* Personnes concernées */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <Label className="text-base font-semibold">{t('quizGames:problemResolver.peopleConcerned')}</Label>
          <span className="text-xs text-muted-foreground ml-auto">
            {persons.length}/4 {t('quizGames:problemResolver.people')}
          </span>
        </div>
        
        <div className="grid gap-3">
          {persons.map((person, index) => {
            const colors = getGenderColors(person.gender);
            return (
            <div 
              key={index} 
              className={`relative flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 rounded-xl border-2 transition-all ${colors.background}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-sm`}>
                <User className="h-5 w-5 text-white" />
              </div>
              
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Input
                    value={person.name}
                    onChange={(e) => updatePerson(index, 'name', e.target.value)}
                    placeholder={t('quizGames:playerSetup.firstName')}
                    maxLength={30}
                    className="bg-background/50"
                  />
                  {errors[`person_${index}`] && (
                    <span className="text-xs text-destructive">{errors[`person_${index}`]}</span>
                  )}
                </div>
                
                <Select
                  value={person.gender}
                  onValueChange={(value: Gender) => updatePerson(index, 'gender', value)}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homme">{t('quizGames:playerSetup.male')}</SelectItem>
                    <SelectItem value="femme">{t('quizGames:playerSetup.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {persons.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePerson(index)}
                  className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );})}
        </div>

        {persons.length < 4 && (
          <Button
            type="button"
            variant="outline"
            onClick={addPerson}
            className="w-full border-dashed border-2 hover:border-solid"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('quizGames:problemResolver.addPerson')} ({persons.length}/4)
          </Button>
        )}
      </div>

      {/* Contexte */}
      <div className="space-y-3">
        <Label htmlFor="context" className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {t('quizGames:problemResolver.contextDescription')}
        </Label>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">{t('quizGames:problemResolver.stayNeutral')}</p>
              <p className="text-muted-foreground">
                {t('quizGames:problemResolver.neutralExplanation')}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/80 italic">
                {t('quizGames:problemResolver.neutralExample')}
              </p>
            </div>
          </div>
        </div>

        <Textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={t('quizGames:problemResolver.contextPlaceholder')}
          maxLength={300}
          rows={4}
          className="resize-none text-base"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{errors.context && <span className="text-destructive">{errors.context}</span>}</span>
          <span className={context.length > 270 ? 'text-amber-500 font-medium' : ''}>{context.length}/300</span>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full h-12 text-base shadow-lg">
        {t('quizGames:problemResolver.validateContinue')}
      </Button>
    </form>
  );
}