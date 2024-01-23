const storageKey = 'notes-app';
const storageData = localStorage.getItem(storageKey);

const initialData = storageData ? JSON.parse(storageData) : {
  firstColumn: [],
  secondColumn: [],
  thirdColumn: []
};

const app = new Vue({
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
      handler: function(newFirstColumn) {
        this.saveData();
      },
      deep: true
    },
    secondColumn: {
      handler: function(newSecondColumn) {
        this.saveData();
        this.checkDisableFirstColumn();
      },
      deep: true
    },
    thirdColumn: {
      handler: function(newThirdColumn) {
        this.saveData();
      },
      deep: true
    },
    items: {
      handler: function(newItems) {
        this.saveData();
        this.checkDisableFirstColumn();
      },
      deep: true
    }
  },
  methods: {
    saveData: function() {
      const data = {
        firstColumn: this.firstColumn,
        secondColumn: this.secondColumn,
        thirdColumn: this.thirdColumn,
        items: this.items
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    },
    deleteGroup: function(groupId) {
      const index = this.thirdColumn.findIndex(group => group.id === groupId);
      if (index !== -1) {
        this.thirdColumn.splice(index, 1);
      }
    },
    updateProgress: function(card, item) {
      const checkedCount = card.items.filter(item => item.checked).length;
      const progress = (checkedCount / card.items.length) * 100;
      card.isComplete = progress === 100;

      if (this.secondColumn.length === 5) {
        card.items.forEach(item => {
          if (!item.checked) {
            item.disabled = true;
          }
        });
      }

      if (item.checked) {
        item.disabled = true;
      } else {
        item.disabled = false;
        this.checkDisableFirstColumn();
      }

      this.checkMoveCard();
    },
    MoveFirstColm: function() {
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
    MoveSecondColm: function() {
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
    checkMoveCard: function() {
      this.MoveFirstColm();
      this.MoveSecondColm();
    },
    checkDisableFirstColumn: function() {
      if (this.secondColumn.length === 5) {
        const areAllSecondColumnComplete = this.secondColumn.every(note => note.isComplete);
        this.firstColumn.forEach(note => {
          note.items.forEach(item => {
            if (progress >= 50 && !areAllSecondColumnComplete) {
              item.disabled = true; // Блокировка всех элементов первого столбца, если хотя бы одна карточка в первом столбце выполнена на 50% или более и одна из карточек второго столбца не является полностью выполненной
            } else {
              item.disabled = areAllSecondColumnComplete;
            }
          });
        });
      } else {
        this.firstColumn.forEach(note => {
          note.items.forEach(item => {
            item.disabled = false;
          });
        });
      }
    },
    addItem: function() {
      if (this.noteTitle && this.items.length < 5 && this.firstColumn.length < 3) {
        if (this.items.some(item => item.text.trim() === '')) {
          return;
        }
        this.items.push({ id: Date.now(), text: '', checked: false });
      }
    },
    createNotes: function() {
      if (
        this.noteTitle &&                      
        this.items.length >= 3 &&              
        this.items.length <= 5 &&            
        !this.items.some(item => !item.text.trim()) 
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
    deleteItem: function(index) {
      this.items.splice(index, 1);
    }
  },
  mounted: function() {
    this.checkDisableFirstColumn();
  }
});