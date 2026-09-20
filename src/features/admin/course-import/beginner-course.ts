/** Original A1 practice material. Only text exercise types supported by the live frontend. */
export type SeedExercise = {
  type: 'translate' | 'fill_gap';
  question: string;
  options: Record<string, never>;
  correct_answer: string;
};
type Task = readonly [prompt: string, answer: string];
function lesson(title: string, rule: string, tasks: Task[]) {
  return {
    title,
    exercises: tasks.map(([prompt, answer]): SeedExercise => ({
      type: prompt.startsWith('Переведите') ? 'translate' : 'fill_gap',
      question:
        rule +
        '\n\n' +
        prompt +
        '\n\nВведите только ответ строчными буквами, без точки.',
      options: {},
      correct_answer: answer,
    })),
  };
}
export const beginnerCourse = {
  courseId: 1,
  title: 'English for Beginners',
  languageId: 1,
  level: 'A1',
  lessons: [
    lesson(
      '01 · Hello! Приветствия и вежливость',
      'Hello — привет; goodbye — до свидания; please — пожалуйста (в просьбе); thank you — спасибо; sorry — извините; good morning — доброе утро; good evening — добрый вечер; good night — спокойной ночи.',
      [
        ['Переведите: «привет». Используйте слово из памятки.', 'hello'],
        [
          'Переведите: «спасибо». Используйте выражение из памятки.',
          'thank you',
        ],
        ['Вставьте пропуск: Good ___! — Доброе утро.', 'morning'],
        ['Вставьте пропуск: Good ___! — Добрый вечер.', 'evening'],
        ['Вставьте пропуск: Good ___! — Спокойной ночи.', 'night'],
        ['Вставьте пропуск: Tea, ___. — Чай, пожалуйста.', 'please'],
        ['Вставьте пропуск: I am ___. — Я сожалею / извините.', 'sorry'],
        [
          'Переведите: «до свидания». Используйте одно слово из памятки.',
          'goodbye',
        ],
      ],
    ),
    lesson(
      '02 · I am Anna. Знакомство',
      'Глагол be: I am; you/we/they are; he/she/it is. My name is… — Меня зовут…; I am from… — Я из… .',
      [
        ['Вставьте am, is или are: I ___ Anna.', 'am'],
        ['Вставьте am, is или are: You ___ my friend.', 'are'],
        ['Вставьте am, is или are: He ___ Tom.', 'is'],
        ['Вставьте am, is или are: She ___ a teacher.', 'is'],
        ['Вставьте am, is или are: We ___ students.', 'are'],
        ['Вставьте am, is или are: They ___ from Kyrgyzstan.', 'are'],
        ['Вставьте пропуск: My ___ is Anna. — Меня зовут Анна.', 'name'],
        ['Вставьте пропуск: I am ___ Bishkek. — Я из Бишкека.', 'from'],
      ],
    ),
    lesson(
      '03 · One, two, three. Числа и возраст',
      '1 one; 2 two; 3 three; 4 four; 5 five; 6 six; 7 seven; 8 eight; 9 nine; 10 ten. Возраст: I am … years old.',
      [
        ['Переведите число «один» словом.', 'one'],
        ['Переведите число «два» словом.', 'two'],
        ['Вставьте следующее число словом: one, two, ___.', 'three'],
        ['Вставьте пропущенное число словом: three, ___, five.', 'four'],
        ['Вставьте следующее число словом: four, five, ___.', 'six'],
        ['Вставьте пропущенное число словом: six, ___, eight.', 'seven'],
        ['Вставьте пропущенное число словом: eight, ___, ten.', 'nine'],
        ['Вставьте пропуск: I am ten years ___. — Мне десять лет.', 'old'],
      ],
    ),
    lesson(
      '04 · My family. Семья',
      'Mother — мама; father — папа; sister — сестра; brother — брат; family — семья. My — мой/моя; your — твой/твоя; her — её; his — его.',
      [
        ['Переведите: «мама». Используйте mother, а не mum.', 'mother'],
        ['Переведите: «папа». Используйте father, а не dad.', 'father'],
        ['Вставьте пропуск: This is my ___. — Это моя сестра.', 'sister'],
        ['Вставьте пропуск: This is my ___. — Это мой брат.', 'brother'],
        ['Вставьте пропуск: My ___ is small. — Моя семья маленькая.', 'family'],
        ['Вставьте my или your: This is ___ mother. — Это моя мама.', 'my'],
        ['Вставьте her или his: Anna is here. ___ brother is Tom.', 'her'],
        ['Вставьте her или his: Tom is here. ___ sister is Anna.', 'his'],
      ],
    ),
    lesson(
      '05 · A book, two books. Предметы',
      'A/an — перед одним исчисляемым предметом: a book, an apple. An ставится перед гласным звуком. Во множественном числе часто добавляется -s: books, pens, cats. This — это (один предмет); these — эти.',
      [
        ['Вставьте a или an: ___ book.', 'a'],
        ['Вставьте a или an: ___ apple.', 'an'],
        ['Вставьте a или an: ___ orange.', 'an'],
        ['Вставьте a или an: ___ pen.', 'a'],
        ['Поставьте book во множественное число: two ___.', 'books'],
        ['Поставьте cat во множественное число: three ___.', 'cats'],
        ['Вставьте this или these: ___ is a pen.', 'this'],
        ['Вставьте this или these: ___ are books.', 'these'],
      ],
    ),
    lesson(
      '06 · Tea, please. Еда и напитки',
      'Water — вода; bread — хлеб; milk — молоко; tea — чай; coffee — кофе; rice — рис. I like… — Мне нравится… . I would like… — Я хотел(а) бы… .',
      [
        ['Переведите: «вода».', 'water'],
        ['Переведите: «хлеб».', 'bread'],
        ['Вставьте пропуск: I drink ___. — Я пью молоко.', 'milk'],
        [
          'Вставьте пропуск: A cup of ___, please. — Чашку чая, пожалуйста.',
          'tea',
        ],
        ['Вставьте пропуск: I like ___. — Мне нравится кофе.', 'coffee'],
        ['Вставьте пропуск: I eat ___. — Я ем рис.', 'rice'],
        ['Вставьте like или likes: I ___ apples.', 'like'],
        ['Вставьте пропуск: I would ___ some water, please.', 'like'],
      ],
    ),
    lesson(
      '07 · At home. Дом и расположение',
      'Room — комната; kitchen — кухня; table — стол; chair — стул. In — в; on — на; under — под. There is — есть (один предмет); there are — есть (несколько).',
      [
        ['Переведите: «кухня».', 'kitchen'],
        ['Переведите: «стул».', 'chair'],
        [
          'Вставьте in, on или under: The book is ___ the table. — Книга на столе.',
          'on',
        ],
        [
          'Вставьте in, on или under: The cat is ___ the chair. — Кот под стулом.',
          'under',
        ],
        [
          'Вставьте in, on или under: The pen is ___ the bag. — Ручка в сумке.',
          'in',
        ],
        ['Вставьте is или are: There ___ a table in the room.', 'is'],
        ['Вставьте is или are: There ___ two chairs in the room.', 'are'],
        ['Вставьте пропуск: This is my ___. — Это моя комната.', 'room'],
      ],
    ),
    lesson(
      '08 · Every day. Повседневные действия',
      'Present Simple: I/you/we/they work; he/she works. С he/she/it обычно добавляется -s, после -ch/-sh/-o — -es. Go → goes; watch → watches. Every day — каждый день.',
      [
        ['Вставьте work или works: I ___ every day.', 'work'],
        ['Вставьте work или works: She ___ every day.', 'works'],
        ['Вставьте play или plays: He ___ football.', 'plays'],
        ['Вставьте like или likes: They ___ tea.', 'like'],
        ['Вставьте go или goes: She ___ to school.', 'goes'],
        ['Вставьте watch или watches: He ___ TV.', 'watches'],
        ['Вставьте read или reads: We ___ books.', 'read'],
        ['Вставьте drink или drinks: My brother ___ water.', 'drinks'],
      ],
    ),
    lesson(
      '09 · Do you like tea? Вопросы и отрицания',
      'Present Simple: Do I/you/we/they…? Does he/she/it…? После do/does глагол без -s. Отрицание: do not / does not. Краткий ответ: Yes, I do. / No, she does not.',
      [
        ['Вставьте do или does: ___ you like tea?', 'do'],
        ['Вставьте do или does: ___ she work here?', 'does'],
        ['Вставьте do или does: ___ they play football?', 'do'],
        ['Вставьте like или likes: Does he ___ coffee?', 'like'],
        ['Вставьте go или goes: Does Anna ___ to school?', 'go'],
        ['Вставьте do или does: I ___ not drink coffee.', 'do'],
        ['Вставьте do или does: She ___ not work here.', 'does'],
        ['Вставьте do или does: Do you like apples? Yes, I ___.', 'do'],
      ],
    ),
    lesson(
      '10 · In town. Город и направления',
      'School — школа; park — парк; shop — магазин; hospital — больница. Left — налево; right — направо; straight — прямо; near — рядом с.',
      [
        ['Переведите: «школа».', 'school'],
        ['Переведите: «парк».', 'park'],
        ['Переведите: «магазин». Используйте shop.', 'shop'],
        ['Переведите: «больница».', 'hospital'],
        ['Вставьте пропуск: Turn ___. — Поверните налево.', 'left'],
        ['Вставьте пропуск: Turn ___. — Поверните направо.', 'right'],
        ['Вставьте пропуск: Go ___. — Идите прямо.', 'straight'],
        [
          'Вставьте пропуск: The shop is ___ the park. — Магазин рядом с парком.',
          'near',
        ],
      ],
    ),
    lesson(
      '11 · I can swim. Умения',
      'Can — мочь/уметь; cannot — не мочь/не уметь. После can глагол без to и без -s: She can swim. Вопрос: Can you swim? Swim — плавать; sing — петь; dance — танцевать; cook — готовить.',
      [
        ['Переведите: «плавать». Используйте слово без to.', 'swim'],
        ['Переведите: «петь». Используйте слово без to.', 'sing'],
        ['Вставьте пропуск: I can ___. — Я умею танцевать.', 'dance'],
        ['Вставьте пропуск: She can ___. — Она умеет готовить.', 'cook'],
        ['Вставьте swim или swims: He can ___.', 'swim'],
        ['Вставьте can или cannot: I ___ swim. — Я не умею плавать.', 'cannot'],
        [
          'Вставьте пропуск: ___ you speak English? — Ты умеешь говорить по-английски?',
          'can',
        ],
        ['Вставьте пропуск: Can you cook? Yes, I ___.', 'can'],
      ],
    ),
    lesson(
      '12 · Review. Итоговое повторение',
      'Повторение: be (am/is/are), a/an, множественное число, Present Simple, can, предлоги и вежливые выражения.',
      [
        ['Вставьте am, is или are: My name ___ Anna.', 'is'],
        ['Вставьте a или an: This is ___ apple.', 'an'],
        ['Поставьте book во множественное число: I have two ___.', 'books'],
        ['Вставьте go или goes: My sister ___ to school.', 'goes'],
        ['Вставьте do или does: ___ your brother like tea?', 'does'],
        ['Вставьте cook или cooks: My father can ___.', 'cook'],
        [
          'Вставьте in, on или under: The book is ___ the bag. — Книга в сумке.',
          'in',
        ],
        ['Переведите: «спасибо». Используйте два слова.', 'thank you'],
      ],
    ),
  ],
};
