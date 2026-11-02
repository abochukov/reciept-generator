import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-counter-lab',
  imports: [],
  templateUrl: './counter-lab.html',
  styleUrl: './counter-lab.scss',
})
export class CounterLab {
  count = signal(0)
  step = signal(1);
  history = signal<number[]>([]);

  isEven = computed(() => this.count() % 2 === 0);
  doubleCount = computed(() => this.count() * 2);

  constructor() {
    effect(() => {
      console.log(`Count value is ${this.count()}, step count is ${this.step()}`);
      this.history.update((items) => [...items, this.count()].slice(-5))
    })
  }

  increment(){
    this.count.update(v => v +this.step())
  }

  decrement() {
    this.count.update(v => v - this.step());
  }

  increaseStep() {
    this.step.update(v => v +  1);
  }

  descreaseStep() {
    this.step.update(v => Math.max(1, v-1));
  }

  reset() {
    this.count.set(0);
  }

}
