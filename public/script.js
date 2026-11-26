const activeTodoList = document.getElementById("active-todo-list");
const completedTodoList = document.getElementById("completed-todo-list");
const activeEmptyMessage = document.getElementById("active-empty-message");
const completedEmptyMessage = document.getElementById("completed-empty-message");
const sortSelect = document.getElementById("sort-select");

// Todo一覧を取得
async function loadTodos() {
  try {
    const response = await fetch("/api/todos");
    const todos = await response.json();

    //並び替え処理
    const sortType = sortSelect.value;

    if (sortType === "newest") {
      todos.sort((a, b) =>　new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortType === "oldest") {
      todos.sort((a, b) =>　new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (sortType === "incomplete") {
      todos.sort((a, b) =>　Number(a.completed) - Number(b.completed)
      );
    }

    activeTodoList.innerHTML = "";
    completedTodoList.innerHTML = "";

    const activeTodos = todos.filter((todo) => !todo.completed);
    const completedTodos = todos.filter((todo) => todo.completed);

    activeEmptyMessage.style.display =activeTodos.length === 0 ? "block" : "none";
    completedEmptyMessage.style.display =completedTodos.length === 0 ? "block" : "none";

    todos.forEach((todo) => {
      const li = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;

      //追加処理
      checkbox.addEventListener("change", async () => {
        try {
          const response = await fetch(`/api/todos/${todo.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              completed: checkbox.checked,
            }),
          });

          if (!response.ok) {
            throw new Error("Todoの更新に失敗しました");
          }

          await loadTodos();
        } catch (error) {
          console.error(error);
          alert("Todoの更新に失敗しました");
          await loadTodos();
        }
      });

      const title = document.createElement("span");
      title.textContent = todo.title;
      title.className = "todo-title";

      //日時の表示
      const createdAt = document.createElement("small");
      createdAt.textContent ="登録日時：" + new Date(todo.createdAt).toLocaleString("ja-JP");
      createdAt.className = "todo-date";

      if (todo.completed) {
        title.classList.add("completed");
      }

      li.appendChild(checkbox);
      li.appendChild(title);
      li.appendChild(createdAt);

      //変更処理
      const editButton = document.createElement("button");
      editButton.textContent = "編集";
      editButton.className = "edit-button";

      editButton.addEventListener("click", async () => {
        const newTitle = prompt("Todoの内容を変更してください", todo.title);

        if (newTitle === null || !newTitle.trim()) {
          return;
        }

        try {
          const response = await fetch(`/api/todos/${todo.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: newTitle.trim(),
            }),
          });

          if (!response.ok) {
            throw new Error("Todoの編集に失敗しました");
          }

          await loadTodos();
        } catch (error) {
          console.error(error);
          alert("Todoの編集に失敗しました");
        }
      });

      li.appendChild(editButton);

      //削除処理
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "削除";
      deleteButton.className = "delete-button";

      deleteButton.addEventListener("click", async () => {
        if (!confirm("このTodoを削除しますか？")) {
          return;
        }

        try {
          const response = await fetch(`/api/todos/${todo.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Todoの削除に失敗しました");
          }

          await loadTodos();
        } catch (error) {
          console.error(error);
          alert("Todoの削除に失敗しました");
        }
      });

      li.appendChild(deleteButton);

      if (todo.completed) {
        completedTodoList.appendChild(li);
      } else {
        activeTodoList.appendChild(li);
      }
    });
  } catch (error) {
    console.error("Todoの取得に失敗しました", error);
  }
}

// ページを開いたときにTodo一覧を取得
loadTodos();

// 並び替えメニューが変更されたとき
sortSelect.addEventListener("change", () => {
  loadTodos();
});

// Todoを追加
const todoForm = document.getElementById("todo-form");
const todoTitle = document.getElementById("todo-title");

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = todoTitle.value.trim();

  if (!title) {
    return;
  }

  try {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error("Todoの登録に失敗しました");
    }

    todoTitle.value = "";

    await loadTodos();
  } catch (error) {
    console.error(error);
    alert("Todoの登録に失敗しました");
  }
});