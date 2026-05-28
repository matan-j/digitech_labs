import NewCourseForm from './NewCourseForm';

export const metadata = { title: 'קורס חדש — Digitech Learning Hub' };

export default function NewCoursePage() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-950">קורס חדש</h1>
        <p className="text-sm text-neutral-500 mt-1">הגדר כותרת ראשונית, ואחר כך הוסף שיעורים בעורך.</p>
      </header>
      <NewCourseForm />
    </div>
  );
}
