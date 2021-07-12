import Head from 'next/head'
import Link from 'next/link'
import { logOut, useIsLoggedIn } from '../../helpers/auth'
import api from '../../helpers/api'
import { GetServerSideProps } from 'next'
import React, { useEffect, useRef, useState } from 'react'

import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

// This gets called on every request
export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch data from external API
  const res = await api.get('/categories')

  const categories = res.data.categories;

  // Pass data to the page via props
  return { props: { categories } }
}

export default function Categories(props: any) {
  const [categories, setCategories] = useState([])
  const isLoggedIn: boolean = useIsLoggedIn();
  const allCategories = props.categories

  const handleLogOut = () => {
    api.post('logout').then(res => logOut())
  }

  let emptyCategory = {
    id: null,
    title: '',
  };

  const [categoryDialog, setCategoryDialog] = useState(false);
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState(false);
  const [category, setCategory] = useState(emptyCategory);
  const [selectedCategories, setSelectedCategories] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const dt = useRef(null);

  useEffect(() => {
    setCategories(allCategories);
  }, [allCategories]);

  const openNew = () => {
    setCategory(emptyCategory);
    setSubmitted(false);
    setCategoryDialog(true);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setCategoryDialog(false);
  }

  const hideDeleteCategoryDialog = () => {
    setDeleteCategoryDialog(false);
  }

  const saveCategory = () => {
    setSubmitted(true);

    if (category.title.trim()) {
      let _category = { ...category };
      if (category.id) {
        api.post(`/admin/categories/${category.id}`, _category).then(res => {
          setCategories(res.data.categories)
        }).catch(e => console.log(e))
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
      }
      else {
        api.post('/admin/categories', _category).then(res => {
          setCategories(res.data.categories)
        }).catch(e => console.log(e))
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Category Created', life: 3000 });
      }

      setCategoryDialog(false);
      setCategory(emptyCategory);
    }
  }

  const editCategory = (category) => {
    setCategory({ ...category });
    setCategoryDialog(true);
  }

  const confirmDeleteCategory = (category) => {
    setCategory(category);
    setDeleteCategoryDialog(true);
  }

  const deleteCategory = () => {
    api.delete(`admin/categories/${category.id}`).then(res => {
      setCategories(res.data.categories)
    }).catch(e => console.log(e))

    setDeleteCategoryDialog(false);
    setCategory(emptyCategory);
    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
  }

  const exportCSV = () => {
    dt.current.exportCSV();
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _category = { ...category };
    _category[`${name}`] = val;

    setCategory(_category);
  }

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button label="New" icon="pi pi-plus" className="p-button-success p-mr-2" onClick={openNew} />
      </React.Fragment>
    )
  }

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} label="Import" chooseLabel="Import" className="p-mr-2 p-d-inline-block" />
        <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
      </React.Fragment>
    )
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => editCategory(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteCategory(rowData)} />
      </React.Fragment>
    );
  }

  const header = (
    <div className="table-header d-flex justify-content-between">
      <h5 className="p-m-0">Manage Categories</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
      </span>
    </div>
  );
  const categoryDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveCategory} />
    </React.Fragment>
  );
  const deleteCategoryDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCategoryDialog} />
      <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteCategory} />
    </React.Fragment>
  );



  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Link href="/cart">Cart</Link>
        {!isLoggedIn &&
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        }
        {isLoggedIn &&
          <button onClick={handleLogOut}>Log out</button>
        }

      </header>

      <main className="container">
        <h1>Categories</h1>

        <div className="datatable-crud">
          <Toast ref={toast} />

          <div className="card">
            <Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

            <DataTable ref={dt} value={categories} selection={selectedCategories} onSelectionChange={(e) => setSelectedCategories(e.value)}
              dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
              globalFilter={globalFilter}
              header={header}>

              <Column headerStyle={{ width: '3rem' }}></Column>
              <Column field="title" header="Name" style={{width:'50%'}} sortable></Column>
              <Column body={actionBodyTemplate}></Column>
            </DataTable>
          </div>

          <Dialog visible={categoryDialog} style={{ width: '450px' }} header="Category Details" modal className="p-fluid" footer={categoryDialogFooter} onHide={hideDialog}>
            <div className="p-field">
              <label htmlFor="title">Name</label>
              <InputText id="title" value={category.title} onChange={(e) => onInputChange(e, 'title')} required autoFocus className={classNames({ 'p-invalid': submitted && !category.title })} />
              {submitted && !category.title && <small className="p-error">Name is required.</small>}
            </div>
          </Dialog>

          <Dialog visible={deleteCategoryDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCategoryDialogFooter} onHide={hideDeleteCategoryDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
              {category && <span>Are you sure you want to delete <b>{category.title}</b>?</span>}
            </div>
          </Dialog>

        </div>


      </main>
    </div>
  )
}
