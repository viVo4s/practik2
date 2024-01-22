const storageKey = 'notes-app';
const storageData = localStorage.getItem(storageKey);

const initialData = storageData ? JSON.parse(storageData) : {
  firstColumn: [],
  secondColumn: [],
  thirdColumn: []
};

let app = new Vue({
  el: '#app',
  data: {
    firstColumn: initialData.firstColumn,
    secondColumn: initialData.secondColumn,
    thirdColumn: initialData.thirdColumn,
    groupName: null,
    inputOne: null,
    inputTwo: null,
    inputThr: null,
    inputFor: null,
    noteTitle: '',
    items: []
  },
  watch: {
    firstColumn: {
      handler(newFirstColumn) {
        this.saveData();
      },
      deep: true
    },
    secondColumn: {
      handler(newSecondColumn) {
        this.saveData();
      },
      deep: true
    },
    thirdColumn: {
      handler(newThirdColumn) {
        this.saveData();
      },
      deep: true
    },
    items: {
      handler(newItems) {
        this.saveData();
      },
      deep: true
    }
  },
  methods: {
    saveData() {
      const data = {
        firstColumn: this.firstColumn,
        secondColumn: this.secondColumn,
        thirdColumn: this.thirdColumn,
        items: this.items
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    },
    deleteGroup(groupId) {
      const index = this.thirdColumn.findIndex(group => group.id === groupId);
      if (index !== -1) {
        this.thirdColumn.splice(index, 1);
      }
    },
    updateProgress(card, item) {
      const checkedCount = card.items.filter(item => item.checked).length;
      const progress = (checkedCount / card.items.length) * 100;
      card.isComplete = progress === 100;

      if (this.secondColumn.length === 4) {
        card.items.forEach(item => {
          if (!item.checked) {
            item.disabled = true;
          }
        });
      }

      if (item.checked) {
        item.disabled = true;
      }

      this.checkMoveCard();
    },
    MoveFirstColm() {
      this.firstColumn.forEach(card => {
        const progress = (card.items.filter(item => item.checked).length / card.items.length) * 100;

        const isMaxSecondColumn = this.secondColumn.length >= 5;

        if (progress >= 50 && !isMaxSecondColumn) {
          this.secondColumn.push(card);
          this.firstColumn.splice(this.firstColumn.indexOf(card), 1);
          this.MoveSecondColm();
        }
      });
    },
    MoveSecondColm() {
      this.secondColumn.forEach(card => {
        const progress = (card.items.filter(item => item.checked).length / card.items.length) * 100;
        if (progress === 100) {
          card.isComplete = true;
          card.lastChecked = new Date().toLocaleString();
          this.thirdColumn.push(card);
          this.secondColumn.splice(this.secondColumn.indexOf(card), 1);
          this.MoveFirstColm();
        }
      })
    },
    checkMoveCard() {
      this.MoveFirstColm();
      this.MoveSecondColm();
    },
    addItem() {
      if (this.noteTitle && this.items.length < 5) {
        this.items.push({ text: '', checked: false });
      }
    },
    createNotes: function() {
        if (
          this.noteTitle &&                      // Проверка на заполненность заголовка
          this.items.length >= 3 &&              // Проверка на минимальное количество элементов
          this.items.length <= 5 &&              // Проверка на максимальное количество элементов
          !this.items.some(item => !item.text.trim())  // Проверка на пустые элементы
        ) {
          const newNoteGroup = {
            id: Date.now(),
            noteTitle: this.noteTitle,
            items: this.items,
            isComplete: false,
            lastChecked: null
          };
  
          this.firstColumn.push(newNoteGroup);
          this.saveData();
  
          this.noteTitle = '';
          this.items = [];
        }
    },
    deleteItem(index) {
      this.items.splice(index, 1);
    }
  }
});