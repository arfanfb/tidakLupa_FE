import React from 'react'
import ReactDOM from 'react-dom'
import request from 'request'
// import $ from "jquery"

const STATUS_WAITING  = 1
const STATUS_CHECK    = 2
const STATUS_PAID     = 3
const STATUS_READY    = 4
const STATUS_SENT     = 5
const STATUS_RECEIVED = 6
const STATUS_REJECT   = 7
const STATUS_ALL      = 8


class MyComponent extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      transactions: null,
      transactions_filtered: null,
      limit: 10,
      page: 1,
      total_page:0,
      filter_click: false,
      filter_value: STATUS_ALL,
      search: false,
      search_value: "",
      waiting: 0,
      check: 0,
      paid: 0,
      list_page: []
    }

    this.getTransaction(window.location.href.split("/").pop())

    this.clickPage = this.clickPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.filterclickHandle = this.filterclickHandle.bind(this);
  }

  getBaseURI() {
    return window.location.origin + "/";
  }

  getTransaction(token) {
    var that = this;
    request.get({url: this.getBaseURI() + "transaction"}, function(err,httpResponse,body){
        that.setState({total_page:Math.ceil(JSON.parse(body).transactions.length / that.state.limit)})

        if(that.state.total_page-1 > 5) {
          that.generatePage(1,5);
        } else {
          that.generatePage(1,that.state.total_page);
        }
        that.setState({transactions:JSON.parse(body).transactions})
        that.setState({transactions_filtered:JSON.parse(body).transactions})

        that.setState({waiting: JSON.parse(body).transactions.filter((item) => item.status == STATUS_WAITING ).length})
        that.setState({check: JSON.parse(body).transactions.filter((item) => item.status == STATUS_CHECK ).length})
        that.setState({paid: JSON.parse(body).transactions.filter((item) => item.status == STATUS_PAID ).length})
    });
  }

  getElement(elm) {
    switch (elm.status) {
      case 1:
        return this.elementWaiting()
        break;
      case 2:
        return this.elementWaiting()
        break;
      default:
    }
  }

  getStatus(elm) {
    switch (elm) {
      case STATUS_WAITING:
        return "waiting"
        break;
      case STATUS_CHECK:
        return "plain"
        break;
      case STATUS_PAID:
        return "success"
        break;
      case STATUS_READY:
        return "waiting"
        break;
      case STATUS_SENT:
        return "success"
        break;
      case STATUS_RECEIVED:
        return "success"
        break;
      case STATUS_REJECT:
        return "reject"
        break;
      default:
        return "plain"
        break
    }
  }

  getOrderinfo(elm) {
    switch (elm) {
      case STATUS_WAITING:
        return (
          <div className="button-status waiting-payment" onClick={this.clickStatus.bind(this, STATUS_WAITING)}><i className="material-icons">refresh</i> Menunggu Pembayaran</div>
        )
        break;
      case STATUS_CHECK:
        return (
          <div className="button-status check" onClick={this.clickStatus.bind(this, STATUS_CHECK)}><i className="material-icons">check</i> Cek Pembayaran</div>
        )
        break;
      case STATUS_PAID:
        return (
          <div className="button-status paid" onClick={this.clickStatus.bind(this, STATUS_PAID)}><i className="material-icons">check_circle</i> Lunas</div>
        )
        break;
      case STATUS_READY:
        return (
          <div className="button-status ready" onClick={this.clickStatus.bind(this, STATUS_READY)}><i className="material-icons">move_to_inbox</i> Sudah Disiapkan</div>
        )
        break;
      case STATUS_SENT:
        return (
          <div className="button-status sent" onClick={this.clickStatus.bind(this, STATUS_SENT)}><i className="material-icons">local_shipping</i> Sudah Dikirim</div>
        )
        break;
      case STATUS_RECEIVED:
        return (
          <div className="button-status received" onClick={this.clickStatus.bind(this, STATUS_RECEIVED)}><i className="material-icons">check_box</i> Sudah Diterima</div>
        )
        break;
      case STATUS_REJECT:
        return (
          <div className="button-status rejected" onClick={this.clickStatus.bind(this, STATUS_REJECT)}><i className="material-icons">cancel</i> Ditolak</div>
        )
        break;
      default:
    }
  }

  paginate() {
    var pg = []
    var start = (this.state.page - 1) * this.state.limit
    var end = this.state.page * this.state.limit - 1

    for (var i = start; i <= end; i++) {
      if(typeof this.state.transactions_filtered[i] != 'undefined') {
          pg.push(this.state.transactions_filtered[i])
      }
    };

    return pg;
  }

  currencyFormat(str) {
    return parseFloat(str).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }

  generatePage(start,end) {
    var list_page = []
    this.setState({list_page:[]})
    for (var i = start; i <= end; i++) {
      list_page.push(i)
    }

    this.setState({list_page:list_page})
  }

  clickPage(new_page) {
    this.setState({page:new_page})
    this.paginate()
  }

  nextPage() {
    if (this.state.page + 1 <= this.state.total_page) {
      if (this.state.page + 1 > Math.max.apply(Math, this.state.list_page)) {
        this.state.list_page.push(this.state.page + 1)
        this.state.list_page.shift()
        this.setState({list_page:this.state.list_page})
      }
      this.setState({page:this.state.page + 1})
    }
  }

  prevPage() {
    if (this.state.page - 1 >= 1) {
      if (Math.min.apply(Math, this.state.list_page) - 1 >= 1) {
        this.state.list_page.unshift(Math.min.apply(Math, this.state.list_page)-1)
        this.state.list_page.pop()
        this.setState({list_page:this.state.list_page})
      }
      this.setState({page:this.state.page - 1})
    }
  }

  handleChange(evt) {
    this.setState({search_value: evt.target.value})
    this.filtering(this.state.filter_value , evt.target.value)
  }

  clickStatus(elm) {
    this.setState({filter_value: elm})
    this.setState({page: 1})
    this.filtering(elm,this.state.search_value)
  }

  filterclickHandle(elm) {
    this.setState({filter_value: elm})
    this.setState({page: 1})
    this.setState({filter_click: !this.state.filter_click})

    this.filtering(elm,this.state.search_value)
  }

  searching(item,elm,text) {
      if (elm) {
        if  ( item.status == elm && ( item.name.toLowerCase().includes(text.toLowerCase()) || item.order_id.toLowerCase().includes(text.toLowerCase()) || item.email.toLowerCase().includes(text.toLowerCase())
        || item.phone.toLowerCase().includes(text.toLowerCase()) || item.total == parseInt(text) || item.method.toLowerCase().includes(text.toLowerCase()) ) ) {
          return true
        }
        return false
      } else {
        if  ( item.name.toLowerCase().includes(text.toLowerCase()) || item.order_id.toLowerCase().includes(text.toLowerCase()) || item.email.toLowerCase().includes(text.toLowerCase())
        || item.phone.toLowerCase().includes(text.toLowerCase()) || item.total == parseInt(text) || item.method.toLowerCase().includes(text.toLowerCase()) ) {
          return true
        }
        return false
      }
  }

  filtering(elm,text) {
    if (elm != STATUS_ALL) {
      this.setState({transactions_filtered:this.state.transactions.filter((item) => this.searching(item,elm,text) )})
      this.setState({total_page:Math.ceil(this.state.transactions.filter((item) => this.searching(item,elm,text) ).length / this.state.limit)})

      var total_page = Math.ceil(this.state.transactions.filter((item) => this.searching(item,elm,text) ).length / this.state.limit)
    } else {
      this.setState({transactions_filtered:this.state.transactions.filter((item) => this.searching(item,false,text) )})
      this.setState({total_page:Math.ceil(this.state.transactions.filter((item) => this.searching(item,false,text) ).length / this.state.limit)})
      console.log(this.state.transactions.filter((item) => this.searching(item,false,text)).length)
      var total_page = Math.ceil(this.state.transactions.filter((item) => this.searching(item,false,text)).length / this.state.limit)
    };

    if(total_page-1 > 5) {
      this.generatePage(1,5);
    } else {
      this.generatePage(1,total_page);
    }
  }

  filter() {
    this.setState({filter_click: !this.state.filter_click})
  }

  search() {
    var that = this
    this.setState({search: !this.state.search})
    this.setState({search_value: ""})

    setTimeout(function () {
        ReactDOM.findDOMNode(that.refs.input_search).focus()
    }, 500);
  }

  getFilterlabel(elm) {
    switch (elm) {
      case STATUS_WAITING:
        return "Menunggu Pembayaran"
        break;
      case STATUS_CHECK:
        return "Cek Pembayaran"
        break;
      case STATUS_PAID:
        return "Lunas"
        break;
      case STATUS_READY:
        return "Sudah Disiapkan"
        break;
      case STATUS_SENT:
        return "Sudah Dikirim"
        break;
      case STATUS_RECEIVED:
        return "Sudah Diterima"
        break;
      case STATUS_REJECT:
        return "Ditolak"
        break;
      default:
        return "Semua"
        break
    }
  }

  render() {
    return (
      <div className="grid">
        <div className="col-2-12 side-bar">
          <div className="logo">
            <div><img src="/images/ralali.png"/></div>
            <div className="version"><h4>CMS V2.1</h4></div>
          </div>
          <div className="menu">
            <hr/>
            <div className="submenu">
              <i className="material-icons">dashboard</i> Dashboard
            </div>
            <div className="submenu">
              <i className="material-icons">store_mall_directory</i> Seller <i className="material-icons float right">arrow_drop_down</i>
            </div>
            <div className="submenu">
              <i className="material-icons">accessibility</i> Buyer <i className="material-icons float right">arrow_drop_down</i>
            </div>
            <div className="submenu active">
              <i className="material-icons">shopping_basket</i> Order <i className="material-icons float right">arrow_drop_down</i>
            </div>
            <div className="submenu">
              <i className="material-icons">shopping_cart</i> Offline Order <i className="material-icons float right">arrow_drop_down</i>
            </div>
            <div className="submenu">
              <i className="material-icons">person_pin</i> Marketing <i className="material-icons float right">arrow_drop_down</i>
            </div>
            <div className="submenu">
              <i className="material-icons">settings</i> Settings <i className="material-icons float right">arrow_drop_down</i>
            </div>
            <div className="submenu">
              <i className="material-icons">content_paste</i> Laporan <i className="material-icons float right">arrow_drop_down</i>
            </div>
          </div>
        </div>
        <div className="col-10-12 content">
          <div className="content-header bg-white">
            <div className="nav-bar float left"><i className="material-icons">keyboard_arrow_left</i> Order</div>
            <div className="user-bar float right"><i className="material-icons">account_circle</i> User Name</div>
            &nbsp;
          </div>

          <div className="content-wrap">
            <div className="grid">
              <div className="col-3-12 widget">
                <div className="widget-wrap">
                  <div className="widget-icon-wrap">
                    <div className="widget-icon float left bg-orange"><h3><i className="material-icons">av_timer</i></h3></div>
                  </div>
                  <div className="float right title">Rata-rata Waktu Order</div>
                  <div className="caption"><h3>1,74 Hari</h3></div>
                  <hr/>
                  <div className="details">
                    <i className="material-icons">language</i> <label><b>Tampilkan Daftar</b></label>
                  </div>
                </div>
              </div>
              <div className="col-3-12 widget">
                <div className="widget-wrap">
                  <div className="widget-icon-wrap">
                    <div className="widget-icon float left bg-red"><h3><i className="material-icons">rotate_right</i></h3></div>
                  </div>
                  <div className="float right title">Belum Dibayar</div>
                  <div className="caption"><h3>{this.state.waiting}</h3></div>
                  <hr/>
                  <div className="details">
                    <i className="material-icons">language</i> <label onClick={this.clickStatus.bind(this, STATUS_WAITING)}><b>Tampilkan Daftar</b></label>
                  </div>
                </div>
              </div>
              <div className="col-3-12 widget">
                <div className="widget-wrap">
                  <div className="widget-icon-wrap">
                    <div className="widget-icon float left bg-tosca"><h3><i className="material-icons">check</i></h3></div>
                  </div>
                  <div className="float right title">Cek Pembayaran</div>
                  <div className="caption"><h3>{this.state.check}</h3></div>
                  <hr/>
                  <div className="details">
                    <i className="material-icons">language</i> <label onClick={this.clickStatus.bind(this, STATUS_CHECK)}><b>Tampilkan Daftar</b></label>
                  </div>
                </div>
              </div>
              <div className="col-3-12 widget">
                <div className="widget-wrap">
                  <div className="widget-icon-wrap">
                    <div className="widget-icon float left bg-green"><h3><i className="material-icons">verified_user</i></h3></div>
                  </div>
                  <div className="float right title">Lunas</div>
                  <div className="caption"><h3>{this.state.paid}</h3></div>
                  <hr/>
                  <div className="details">
                    <i className="material-icons">language</i> <label onClick={this.clickStatus.bind(this, STATUS_PAID)}><b>Tampilkan Daftar</b></label>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-overlay bg-orange">
              <div className="overlay-1 float left">
                <div>
                  <h3>Daftar Order</h3>Menampilkan & mengelola order
                </div>
              </div>
              <div className="overlay-2 float right">
                + BUAT ORDER BARU
              </div>
            </div>
            <div className="grid content-layer bg-white">
              <div className="grid content-list">
                <div className="grid">
                  <div className="float right search-bar">
                    Pencarian <i className="material-icons search-icon" onClick={this.search.bind(this)}><input type="text" ref="input_search" className={(this.state.search) ? "" : "hidden"} value={this.state.search_value} onChange={this.handleChange.bind(this)}/> search</i> <i className="material-icons">keyboard_arrow_down</i>
                  </div>
                </div>
                <div className="grid filter-bar">
                  <div className="col-3-12">
                    Hasil untuk <b>{this.getFilterlabel(this.state.filter_value)}</b>
                  </div>
                  <div className="col-9-12 text right">
                    <div className="grid">
                      <div className="col-8-12">Filter Berdasarkan</div>
                      <div className="col-4-12 filter-item">
                        <div className="selected" onClick={this.filter.bind(this)}>{this.getFilterlabel(this.state.filter_value)} <i className="material-icons">keyboard_arrow_down</i></div>
                        <div className={(this.state.filter_click) ? "option" : "option hidden"}>
                          <div className="option-item bg-white" onClick={this.filterclickHandle.bind(this,STATUS_ALL)}>Semua</div>
                          <div className="option-item bg-white" onClick={this.filterclickHandle.bind(this,STATUS_WAITING)}>Menunggu Pembayaran</div>
                          <div className="option-item bg-white" onClick={this.filterclickHandle.bind(this,STATUS_CHECK)}>Cek Pembayaran</div>
                          <div className="option-item bg-white" onClick={this.filterclickHandle.bind(this,STATUS_PAID)}>Lunas</div>
                          <div className="option-item bg-white" onClick={this.filterclickHandle.bind(this,STATUS_READY)}>Sudah Disiapkan</div>
                          <div className="option-item bg-white" onClick={this.filterclickHandle.bind(this,STATUS_SENT)}>Sudah Dikirim</div>
                          <div className="option-item bg-white" onClick={this.filterclickHandle.bind(this,STATUS_RECEIVED)}>Sudah Diterima</div>
                          <div className="option-item bg-white" onClick={this.filterclickHandle.bind(this,STATUS_REJECT)}>Ditolak</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid list header">
                  <div className="col-2-12 c-190">
                    Nomor Order
                  </div>
                  <div className="col-2-12 c-190">
                    Buyer
                  </div>
                  <div className="col-2-12 c-110">
                    Waktu Order
                  </div>
                  <div className="col-2-12 c-130">
                    Total
                  </div>
                  <div className="col-2-12 c-130">
                    Met. Pembayaran
                  </div>
                  <div className="col-2-12 c-150">
                    Actions
                  </div>
                </div>
                { (this.state.transactions_filtered != null) ?
                  this.paginate().map(function(item) {
                      return (
                        <div className={this.getStatus(item.status) + " grid list"}>
                          <div className="col-2-12 c-190">
                            <label className="grid"><b>{item.order_id}</b></label>
                            {this.getOrderinfo(item.status)}
                          </div>
                          <div className="col-2-12 c-190 buyer">
                            <label><b>{item.name}</b></label>
                            <div><i className="material-icons">email</i> {item.email}</div>
                            <div><i className="material-icons">phone</i> {item.phone}</div>
                          </div>
                          <div className="col-2-12 c-110">
                            <label>18 Maret 2017 17:05:51</label>
                          </div>
                          <div className="col-2-12 c-130">
                            <label><b>Rp {this.currencyFormat(item.total)}</b></label>
                          </div>
                          <div className="col-2-12 c-130">
                            {item.method}
                          </div>
                          <div className="col-2-12 c-150">
                            <label className="grid"><div className="button-detail"><i className="material-icons">description</i> Lihat Detail</div></label>
                            <div className="">
                              <i className="material-icons button-action">account_balance_wallet</i><i className="material-icons button-action">done_all</i><i className="button-action">DO</i><i className="material-icons button-action">picture_as_pdf</i>
                            </div>
                          </div>
                        </div>
                      )
                  }, this) : ""
                }
              </div>
              <div className="grid pagination">
                <div className="col-3-12 left">
                  Menampilkan {(this.state.page - 1) * this.state.limit + 1} - {this.state.page * this.state.limit} dari {(this.state.transactions_filtered) ? this.state.transactions_filtered.length : 0}
                </div>
                <div className="col-6-12 center">
                  <div className="prev" onClick={this.prevPage.bind(this)}>
                    PREV
                  </div>
                  { (this.state.list_page !=null) ?
                    this.state.list_page.map(function(item) {
                      return (
                        <div className={(item == this.state.page) ? "active page" : "page"} onClick={this.clickPage.bind(this,item)}>
                          {item}
                        </div>
                      )
                    },this) : ""
                  }
                  <div className="next" onClick={this.nextPage.bind(this)}>
                    NEXT
                  </div>
                </div>
                <div className="col-3-12 right">
                  <div className="per-view">
                    10 <i className="material-icons">keyboard_arrow_down</i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
};

ReactDOM.render(<MyComponent />, document.getElementById('ralali'));
