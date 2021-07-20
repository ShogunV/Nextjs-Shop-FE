import Head from 'next/head'
import api from '../../helpers/api'
import { GetServerSideProps } from 'next'
import React, { useEffect, useRef, useState } from 'react'

import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadSelectParams } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeParams } from 'primereact/radiobutton';
import { InputNumber, InputNumberValueChangeParams } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import Image from 'next/image'
import Header from '../../components/header'
import { CartProduct, ProductCategory } from '../../types'

// This gets called on every request
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Fetch data from external API
  try {
    const res = await api.get('admin/products', {
      headers: context?.req?.headers?.cookie ? { cookie: context.req.headers.cookie } : undefined,
    })

    if (res.data.error) {
      return { redirect: { destination: '/', permanent: false } }
    }

    const products = res.data.products;
    const categories = res.data.categories;
    // Pass data to the page via props
    return { props: { products, categories } }
  } catch (err) {
    return { redirect: { destination: '/', permanent: false } }
  }
}

export default function Products(props: any) {
  const [products, setProducts] = useState([])
  const allProducts = props.products
  const allCategories = props.categories
  const fileUploadRef = useRef<HTMLInputElement>(null)

  let emptyProduct: CartProduct = {
    id: 0,
    title: '',
    image: '',
    description: '',
    category: '',
    category_id: 0,
    price: 0,
    discount: 0,
    quantity: 0,
  };

  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [product, setProduct] = useState(emptyProduct);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [newImage, setNewImage] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable>(null);

  useEffect(() => {
    setProducts(allProducts);
  }, [allProducts]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'EUR' });
  }

  const openNew = () => {
    setProduct(emptyProduct);
    setSubmitted(false);
    setProductDialog(true);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
  }

  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  }

  const saveProduct = () => {
    setSubmitted(true);

    if (product.title.trim() && product.category_id && product.price) {
      let _product = { ...product };
      if (product.id) {
        const data = new FormData()
        if (fileUploadRef !== null) {
          if (newImage && fileUploadRef.current && fileUploadRef.current.files && fileUploadRef.current.files.length > 0) {
            _product.image = fileUploadRef.current.files[0];
            data.append('image', _product.image);
          }
        }
        data.append('id', String(product.id));
        data.append('price', String(_product.price));
        data.append('title', _product.title);
        data.append('category_id', String(_product.category_id));
        data.append('discount', String(_product.discount));
        data.append('description', _product.description);
        data.append('_method', 'put');
        api.post(`/admin/products/${product.id}`, data).then(res => {
          setProducts(res.data.products)
          toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        }).catch(e => console.log(e))
      }
      else {
        const data = new FormData()
        if (newImage && fileUploadRef.current && fileUploadRef.current.files && fileUploadRef.current.files.length > 0) {
          _product.image = fileUploadRef.current.files[0];
          data.append('image', _product.image);
        }
        data.append('price', String(_product.price));
        data.append('title', _product.title);
        data.append('category_id', String(_product.category_id));
        data.append('discount', String(_product.discount));
        data.append('description', _product.description);
        api.post('/admin/products', data).then(res => {
          setProducts(res.data.products)
          toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }).catch(e => console.log(e))
      }

      setProductDialog(false);
      setProduct(emptyProduct);
    }
  }

  const editProduct = (product: CartProduct) => {
    setProduct({ ...product });
    setProductDialog(true);
  }

  const confirmDeleteProduct = (product: CartProduct) => {
    setProduct(product);
    setDeleteProductDialog(true);
  }

  const deleteProduct = () => {
    api.delete(`admin/products/${product.id}`).then(res => {
      setProducts(res.data.products)
    }).catch(e => console.log(e))

    setDeleteProductDialog(false);
    setProduct(emptyProduct);
    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
  }

  const exportCSV = () => {
    dt.current?.exportCSV({ selectionOnly: false });
  }

  const onCategoryChange = (e: RadioButtonChangeParams) => {
    let _product = { ...product };
    _product['category_id'] = +e.target.value;
    setProduct(_product);
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
    const val = (e.target && e.target.value) || '';
    const _product = { ...product, [name]: val };

    setProduct(_product);
  }

  const onInputNumberChange = (e: InputNumberValueChangeParams, name: string) => {
    const val = (e.target && e.target.value) || 0;
    const _product = { ...product, [name]: val };

    setProduct(_product);
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
        <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="p-mr-2 p-d-inline-block" />
        <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
      </React.Fragment>
    )
  }

  const imageBodyTemplate = (rowData: CartProduct) => {
    return <Image src={`http://localhost:8000/storage/${rowData.image ? rowData.image : 'images/No_image_available.png'}`} width={120} height={120} layout='responsive' alt={rowData.title} className="product-image" />
  }

  const priceBodyTemplate = (rowData: CartProduct) => {
    return formatCurrency(rowData.price);
  }

  const discountBodyTemplate = (rowData: CartProduct) => {
    return rowData.discount + '%';
  }

  const actionBodyTemplate = (rowData: CartProduct) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => editProduct(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteProduct(rowData)} />
      </React.Fragment>
    );
  }

  const header = (
    <div className="table-header d-flex justify-content-between">
      <h5 className="p-m-0">Manage Products</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)} placeholder="Search..." />
      </span>
    </div>
  );
  const productDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveProduct} />
    </React.Fragment>
  );
  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
      <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteProduct} />
    </React.Fragment>
  );
  const onUpload = (e: FileUploadSelectParams) => {
    setNewImage(true)
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container">
        <h1>Products</h1>

        <div className="datatable-crud">
          <Toast ref={toast} />

          <div className="card">
            <Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

            <DataTable ref={dt} value={products} selection={selectedProducts} onSelectionChange={(e) => setSelectedProducts(e.value)}
              dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
              globalFilter={globalFilter}
              header={header}>

              <Column headerStyle={{ width: '3rem' }}></Column>
              <Column field="title" header="Name" sortable></Column>
              <Column header="Image" body={imageBodyTemplate}></Column>
              <Column field="price" header="Price" body={priceBodyTemplate} sortable></Column>
              <Column field="discount" header="Discount" body={discountBodyTemplate} sortable></Column>
              <Column field="category" header="Category" sortable></Column>
              <Column body={actionBodyTemplate}></Column>
            </DataTable>
          </div>

          <Dialog visible={productDialog} style={{ width: '450px' }} header="Product Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
            {product.image && <Image src={`http://localhost:8000/storage/${product.image ? product.image : 'images/No_image_available.png'}`} width={120} height={120} layout='responsive' alt="PRoduct image" className="product-image" />}
            <div className="p-field">
              <label htmlFor="title">Name</label>
              <InputText id="title" value={product.title} onChange={(e) => onInputChange(e, 'title')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.title })} />
              {submitted && !product.title && <small className="p-error">Name is required.</small>}
            </div>
            <div className="p-field">
              <label htmlFor="description">Description</label>
              <InputTextarea id="description" value={product.description} onChange={(e) => onInputChange(e, 'description')} required rows={3} cols={20} />
            </div>

            <div className="p-field">
              <label className="p-mb-3">Category</label>
              <div className="p-formgrid p-grid">
                {allCategories.map((category: ProductCategory) => (
                  <div key={category.id} className="p-field-radiobutton p-col-6">
                    <RadioButton inputId={`category-${category.id}`} name="category" value={category.id} onChange={onCategoryChange} checked={product.category_id === category.id} />
                    <label htmlFor={`category-${category.id}`}>{category.title}</label>
                  </div>
                ))}
              </div>
              {submitted && !product.category_id && <small className="p-error">Category is required.</small>}
            </div>

            <div className="p-field">
              <label className="p-mb-3">Product Image</label>
              <FileUpload name="image" url={`http://localhost:8000/storage/`} onSelect={onUpload} mode="basic" chooseLabel={product.image ? product.image.toString().replace('images/', '') : 'Choose'} />
            </div>

            <div className="p-formgrid p-grid">
              <div className="p-field p-col">
                <label htmlFor="price">Price</label>
                <InputNumber id="price" value={product.price} onValueChange={(e) => onInputNumberChange(e, 'price')} suffix="€" className={classNames({ 'p-invalid': submitted && !product.price })} />
                {submitted && !product.price && <small className="p-error">Price is required.</small>}
              </div>
              <div className="p-field p-col">
                <label htmlFor="discount">Discount</label>
                <InputNumber id="discount" value={product.discount} min={0} max={100} onValueChange={(e) => onInputNumberChange(e, 'discount')} suffix="%" />
              </div>
            </div>
          </Dialog>

          <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
              {product && <span>Are you sure you want to delete <b>{product.title}</b>?</span>}
            </div>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
