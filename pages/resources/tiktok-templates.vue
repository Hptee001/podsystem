<template>
  <div>
    <!-- Alert -->
    <b-alert
      variant="danger"
      dismissible
      fade
      :show="isError"
      @dismissed="isError = false"
    >
      Error: {{ messageError }}
    </b-alert>
    <div v-if="isLoading" class="text-center">
      <b-spinner label="Spinning"></b-spinner>
      <b-spinner type="grow" label="Spinning"></b-spinner>
      <b-spinner variant="primary" label="Spinning"></b-spinner>
      <b-spinner variant="primary" type="grow" label="Spinning"></b-spinner>
      <b-spinner variant="success" label="Spinning"></b-spinner>
      <b-spinner variant="success" type="grow" label="Spinning"></b-spinner>
    </div>
    <CCard>
      <CCardHeader>
        <b-row style="margin: 0px">
          <b-col cols="auto" class="p-3" style="padding: 0px; margin: 0px">
            <b-form-file
              v-model="inputfile"
              :state="Boolean(inputfile)"
              placeholder="Choose a file or drop it here..."
              drop-placeholder="Drop file here..."
            ></b-form-file>
            
          </b-col>
          <b-col cols="auto" class="mr-auto p-3"><b-button variant="success" @click="UploadFile()">Upload File</b-button></b-col>
        </b-row>
      </CCardHeader>
      <b-table responsive striped hover :items="items" :fields="fields">
        <template #cell(actions)="row">
          <b-button
            variant="outline-primary"
            size="sm"
            @click="editItem(row.item, row.index, $event.target)"
            class="mr-1"
          >
            <b-icon-pencil-square></b-icon-pencil-square> Edit
          </b-button>
          <b-button
            variant="outline-danger"
            size="sm"
            @click="deleteItem(row.item, row.index, $event.target)"
            class="mr-1"
          >
            <b-icon-trash></b-icon-trash> Delete
          </b-button>
        </template>
      </b-table>
    </CCard>

    <!-- The modal -->

    <b-modal v-model="dialogDelete" @ok="deleteItemConfirm"
      >Do you want delete this account{{ edititem.username }}?!</b-modal
    >
    <b-modal
      v-model="dialog"
      @hidden="close"
      @ok="save"
      centered
      title="Account"
    >
      <b-spinner v-if="isLoading" type="grow" label="Spinning"></b-spinner>

      <CInput
        v-model="edititem.name"
        label="Name"
        placeholder="Template Shirt"
      />
      <CInput
        v-model="edititem.filename"
        label="File Name"
        :readonly="true"
      />
      </CRow>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
      isError: false,
      messageError: "",
      dialog: false,
      dialogDelete: false,
      members: [],
      inputfile: null,
      option_members: [],
      options_roles: [
        {
          value: "admin",
          lablel: "Admin",
        },
        {
          value: "seller",
          lablel: "Seller",
        },
        {
          value: "designer",
          lablel: "Designer",
        },
        {
          value: "fulfillment",
          lablel: "Fulfillment",
        },
      ],
      fields: [
        {
          label: "Id",
          key: "id",
        },
        {
          label: "name",
          key: "name",
        },
        {
          label: "filename",
          key: "filename",
        },
        {
          label: "created_at",
          key: "created_at",
        },
        {
          label: "Actions",
          key: "actions",
          tdClass: "tdactions",
        },
      ],
      items: [],
      editedIndex: -1,
      defaultitem: {
        id: -1,
        username: "",
        fullname: "",
        password: "",
        status: "active",
        role: "",
      },
      edititem: {
        id: -1,
        username: "",
        fullname: "",
        password: "",
        status: "active",
        role: "",
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Account" : "Edit Account";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.isLoading = true;
      this.$axios
        .get("/tiktoktemplates", {
          headers: {
            Authorization: this.$auth.getToken("local"),
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          this.items = response.data.data;
          this.isLoading = false;
        })
        .catch(function (error) {
          this.messageError = error.message;
          this.isError = true;
          console.log(error);
        });
    },
    async add() {
      this.dialog = !this.dialog;
      this.editeditem = Object.assign(this.defaultitem);
      this.editeditem.id = 0;
      console.log(this.edititem);
    },
    async save(bvModalEvt) {
      this.isLoading = true;
      console.log(this.edititem.sellers);
      console.log(this.edititem);
      if (this.edititem.id < 1) {
        this.edititem.id = 0;
        const json = JSON.stringify(this.edititem);
        this.$axios
          .post("/tiktoktemplates", json, {
            headers: {
              // Overwrite Axios's automatically set Content-Type
              Authorization: this.$auth.getToken("local"),
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log(response);
            this.edititem = this.defaultitem;
            this.dialog = false;
            this.makeToast("success", "Saved");
            this.initialize();
            //this.$router.go()
          })
          .catch((error) => {
            this.messageError = error.message;
            this.isError = true;
            this.isLoading = false;
            this.makeToast("danger", error.messageError);
            console.log(error);
          });
      } else {
        const json = JSON.stringify(this.edititem);
        this.$axios
          .put("/tiktoktemplates/" + this.edititem.id, json, {
            headers: {
              // Overwrite Axios's automatically set Content-Type
              Authorization: this.$auth.getToken("local"),
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log(response.data);
            this.dialog = false;
            this.makeToast("success", "Saved");
            this.initialize();
            //this.$router.go()
          })
          .catch((error) => {
            this.messageError = error.message;
            this.isError = true;
            this.isLoading = false;
            this.makeToast("danger", error.messageError);
          });
      }
    },
    async editItem(item) {
      this.isLoading = true;
      this.editedIndex = this.items.indexOf(item);
      this.edititem = Object.assign({}, item);

      await this.$axios
        .get("/tiktoktemplates/" + item.id, {
          headers: {
            // Overwrite Axios's automatically set Content-Type
            Authorization: this.$auth.getToken("local"),
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log(response.data);
          this.edititem = response.data;
          console.log(this.item);
          this.isLoading = false;
          //this.$router.go()
        })
        .catch(function (error) {
          this.messageError = error.message;
          this.isError = true;
          this.isLoading = false;
          console.log(error);
        });

      this.dialog = true;
    },
    async UploadFile() {
        this.isLoading = true;
        const fdata = new FormData();
        fdata.append("file", this.inputfile);
        await this.$axios
            .post("/tiktoktemplates/upload" , fdata, {
          headers: {
            Authorization: this.$auth.getToken("local"),
            'Content-Type': 'multipart/form-data'
          },
        })
        .then((response) => {
        })
        .catch(function (error) {
          this.messageError = error.message;
          this.isError = true;
        });
        
        this.isLoading = false;
         this.initialize();
    },
    deleteItem(item) {
      this.editedIndex = this.items.indexOf(item);
      this.edititem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      this.$axios
        .delete("/tiktoktemplates/" + this.edititem.id, {
          headers: {
            Authorization: this.$auth.getToken("local"),
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log(response.data);
          this.initialize();
          this.closeDelete();
        })
        .catch(function (error) {
          this.messageError = error.message;
          this.isError = true;
          this.isLoading = false;
          console.log(error);
        });
    },
    makeToast(variant = null, message) {
      this.$bvToast.toast(message, {
        title: `Alert ${variant || "default"}`,
        variant: variant,
        solid: true,
      });
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.edititem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
  },
};
</script>

<style>
.form-control {
  color: black;
}

.form-control:focus {
  color: black;
}

.p-3 {
  padding: 0rem !important;
}

.tdactions {
  min-width: 180px;
}
</style>
