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
  displayedTodos: any[] = [];
  userIds: number[] = [];
  filterForm: FormGroup;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

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
      this.updateDisplayedTodos();
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
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

    this.currentPage = 1;
    this.updateDisplayedTodos();
  }

  updateDisplayedTodos() {
    this.totalPages = Math.ceil(this.filteredTodos.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedTodos = this.filteredTodos.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedTodos();
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    pages.push(1);
    if (this.currentPage > 2) {
      pages.push(this.currentPage - 1);
    }
    if (this.currentPage !== 1 && this.currentPage !== this.totalPages) {
      pages.push(this.currentPage);
    }
    if (this.currentPage < this.totalPages - 1) {
      pages.push(this.currentPage + 1);
    }
    if (this.totalPages > 1) {
      pages.push(this.totalPages);
    }
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  }

  resetFilters() {
    this.filterForm.reset({
      searchText: '',
      completedFilter: null,
      selectedUserIds: []
    });
    this.currentPage = 1;
    this.updateDisplayedTodos();
  }
}
