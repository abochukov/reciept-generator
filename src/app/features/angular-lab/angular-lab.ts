import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';

interface LabTask {
  id: number;
  title: string;
  done: boolean;
}

@Component({
  selector: 'app-angular-lab',
  imports: [CommonModule],
  templateUrl: './angular-lab.html',
  styleUrl: './angular-lab.scss'
})
export class AngularLabComponent {
  private nextId = signal(4);

  tasks = signal<LabTask[]>([
    { id: 1, title: 'Прочети за signal()', done: true },
    { id: 2, title: 'Тествай computed()', done: false },
    { id: 3, title: 'Пробвай @defer блок', done: false }
  ]);

  filter = signal<'all' | 'active' | 'done'>('all');
  search = signal('');

  filteredTasks = computed(() => {
    const query = this.search().trim().toLowerCase();

    return this.tasks().filter((task) => {
      const matchesFilter =
        this.filter() === 'all' ||
        (this.filter() === 'done' && task.done) ||
        (this.filter() === 'active' && !task.done);

      if (!query) {
        return matchesFilter;
      }

      return matchesFilter && task.title.toLowerCase().includes(query);
    });
  });

  summary = computed(() => {
    const all = this.tasks();
    const done = all.filter((t) => t.done).length;

    return {
      total: all.length,
      done,
      active: all.length - done
    };
  });

  constructor() {
    effect(() => {
      const state = {
        filter: this.filter(),
        search: this.search(),
        total: this.summary().total
      };

      localStorage.setItem('angular-lab-state', JSON.stringify(state));
    });
  }

  addTask(input: HTMLInputElement) {
    const value = input.value.trim();

    if (!value) {
      return;
    }

    this.tasks.update((items) => [
      ...items,
      { id: this.nextId(), title: value, done: false }
    ]);
    this.nextId.update((id) => id + 1);
    input.value = '';
  }

  toggleTask(taskId: number) {
    this.tasks.update((items) =>
      items.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );
  }

  removeTask(taskId: number) {
    this.tasks.update((items) => items.filter((task) => task.id !== taskId));
  }

  setFilter(value: 'all' | 'active' | 'done') {
    this.filter.set(value);
  }

  onSearch(value: string) {
    this.search.set(value);
  }
}
