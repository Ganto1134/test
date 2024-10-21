import { Component, OnInit } from '@angular/core';
import { TodoService } from './services/todo.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  todos: any[] = [];
  filteredTodos: any[] = [];
  userIds: number[] = [];
  filterForm: FormGroup;

  constructor(private todoService: TodoService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      searchText: [''],
      completedFilter: [null],
      selectedUserIds: [[]]
    });
  }

  ngOnInit(): void {
    this.todoService.getTodos().subscribe(data => {
      this.todos = data;
      this.filteredTodos = this.todos;
      this.userIds = [...new Set(this.todos.map(todo => todo.userId))];
      this.filterForm.valueChanges.subscribe(() => {
        this.applyFilters();
      });
    });
  }

  applyFilters() {
    const { searchText, completedFilter, selectedUserIds } = this.filterForm.value;

    this.filteredTodos = this.todos.filter(todo => {
      const matchesSearch = searchText
        ? todo.title.toLowerCase().includes(searchText.toLowerCase())
        : true;
      const matchesCompleted = completedFilter === null
        ? true
        : todo.completed === completedFilter;
      const matchesUser = selectedUserIds.length === 0
        ? true
        : selectedUserIds.includes(todo.userId);

      return matchesSearch && matchesCompleted && matchesUser;
    });
  }

  resetFilters() {
    this.filterForm.reset({
      searchText: '',
      completedFilter: null,
      selectedUserIds: []
    });
  }
}
