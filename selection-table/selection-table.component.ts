/* 
#==============================================================================================================================#
#   AUTHOR: Mu Sigma                                                                                                            #
#   CREATED ON: 2018-01-05                                                                                                     #
#   DESCRIPTION:Populates the Selection table on Trait selection screen , triggers the comparision table                       #
#   ARGUMENTS: the  messge pass funcrion recieves the message as argument                                                      #
#                                                                                                                              #
#                                                                                                                              #
#   REVISION DETAILS:                                                                                                          #
#   Version No.         Date            Author          Change Description                                                     #
#   *************       ************    ************    *********************************                                      #
#   23.0                 2018-01-05      vn5005t            New                                                                 #
################################################################################################################################
*/


import { Component, ViewChildren, QueryList,OnInit, AfterViewInit, Input, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { MatIconRegistry } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import * as _ from 'underscore';
import { FetchDataService } from "../../services/data/fetch-data.service";
import { DataPassingService } from "../../services/utils/data-passing.service";
import { MatSnackBar } from '@angular/material';
import { Router } from "@angular/router";
import { AuthService } from '../../services/auth/auth.service';
import { CategoryPickerService } from '../../services/utils/category-picker.service'
import { environment } from '../../../environments/environment';
import { Sort } from '@angular/material';
import { MatSortModule } from '@angular/material';
@Component({
  selector: 'selection-table',
  templateUrl: './selection-table.component.html',
  styleUrls: ['./selection-table.component.scss']
})
export class SelectionTableComponent implements OnInit {
  RowWidth: string;
  displayedColumns_SelectionTable: any[];
  dataSource_SelectionTable: any;
  displayedColumns_ComparisonTable = [];
  dataSource_ComparisonTable: any;
  StoreValues: any;
  postData: any;
  private parentNativeElement: any;
  allCatgData: any;
  currentCatgNumber: any;
  checkedTraits = [];
  @(ViewChildren)(MatPaginator) paginator:QueryList <MatPaginator>;
  pageIndex :any;
  pageSize:any;
  objectKeys = Object.keys;
  summaryData = [];
  hideButton: any;
  url: string;
  saveUrl: string;
  sortedData;
  // columns that needs to be sent to the comparision table
  columnsForComp = ['Rank', 'UDF_1', 'Mod_SPSPW', 'Mod_UPSPW', 'Market_Sales_$_Coverage', 'Market_Sales_Quantity_Coverage', 'UPC_Nielsen_Percentage']
  existingModular = {};
  data: any;
  catgLevelData = [];
  constructor(public catgPicker: CategoryPickerService,
    private authService: AuthService,
    public snackBar: MatSnackBar,
    private fetchDataService: FetchDataService,
    private dataService: DataPassingService,


    private router: Router, private http: Http,
    @Inject(Window) private _window: Window
  ) {

    this.StoreValues = this.dataService.getData()["data"]["storeValues"];
    this.currentCatgNumber = '-1';
    this.url = environment.getTraitSelectionUrl;
    //this.url = "http://" + this._window.location.host + "/assets/trait_selection_data.json" 
    this.saveUrl = environment.saveTraitSelectionUrl;
    this.catgPickerLength = 10;
    this.catgPickerList = [];
    this.hideButton = 1;
  }
  // array of catg List
  selectedCatgCnt = {};
  selectedCatgIndex = {};
  catgList: any[];
  // contains the list of categories to be displayed in the category picker component
  catgPickerList: any[];
  //number of items to show in category picker
  catgPickerLength: number;

  //displays an alert if there are any violations in the traits selected
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

  //generates the data for comparison table on selecting traits for a category
  genComparisionTableData(cur) {
    var currentSelectedTrait = cur;
    var comparisionData = [];
    for (let i of this.columnsForComp) {
      var tempObject = {};
      tempObject["Metrics"] = i;
      if (currentSelectedTrait != "") {
        if (this.existingModular[currentSelectedTrait.Category] != undefined) {
          tempObject["Existing"] = this.existingModular[currentSelectedTrait.Category][i];
        }
        else {
          tempObject["Existing"] = " ";
        }
        tempObject["Selected"] = currentSelectedTrait[i]
      }
      else if (currentSelectedTrait == "") {
        if (this.existingModular[this.currentCatgNumber] != undefined) {
          tempObject["Existing"] = this.existingModular[this.currentCatgNumber][i];
        }
        else {
          tempObject["Existing"] = " ";
        }
      }
      comparisionData.push(tempObject);
    }
    this.displayedColumns_ComparisonTable = Object.keys(comparisionData[0])
    this.dataSource_ComparisonTable = new MatTableDataSource<any>(comparisionData)
  }
  //function to check if count if a selected category has exceeded maximum violation for a category
  isMaxViolation(rIndex) {
    var isViolation = 0;

    var selectedRow = this.dataSource_SelectionTable.data[rIndex];
    if (this.selectedCatgCnt[selectedRow["Category"]] == undefined) {
      this.selectedCatgCnt[selectedRow["Category"]] = { "count": 0, "Min": selectedRow["Min"], "Max": selectedRow["Max"] };
      //this.selectedCatgCnt[selectedRow["Category"]] = 0;
    }
    if (!selectedRow.selected) {
      if (parseInt(this.selectedCatgCnt[selectedRow["Category"]].count) == parseInt(selectedRow["Max"])) {
        isViolation = 1;
        var violation = selectedRow;
        this.openSnackBar("Violation for Category:" + violation.Category, "Max is " + violation.Max);
      }
      else {
        this.selectedCatgCnt[selectedRow["Category"]].count += 1;
      }
    }
    else {
      this.selectedCatgCnt[selectedRow["Category"]].count -= 1;
    }
    console.log("is violation", isViolation);
    return isViolation;

  }
  //identifies which row is selected and checks if there are violations for the selected row
  checkRow(rIndex) {
    if (this.dataSource_SelectionTable.data[rIndex].Rank == 0) {
      // this.openSnackBar("Rank 0 Trait" , "Close");
      return;
    }
    if (!this.isMaxViolation(rIndex)) {
      if (this.dataSource_SelectionTable.data[rIndex].selected) {
        console.log("SelectedIdx", this.dataSource_SelectionTable.data[rIndex].index);
        var unselectIdx = this.checkedTraits.findIndex(e => e.index === this.dataSource_SelectionTable.data[rIndex].index);
        console.log("unselectIdx", unselectIdx, "checkedTraits", this.checkedTraits);

        this.checkedTraits.splice(unselectIdx, 1);
        console.log("spliced", this.checkedTraits);
        this.dataSource_SelectionTable.data[rIndex].selected = 0;
      }
      else {
        this.checkedTraits.push(this.dataSource_SelectionTable.data[rIndex])
        this.dataSource_SelectionTable.data[rIndex].selected = 1;
      }
    }
    if (this.currentCatgNumber != '-1') {
      if (this.dataSource_SelectionTable.data[rIndex].selected) {
        this.genComparisionTableData(this.dataSource_SelectionTable.data[rIndex]);
      }
      else {
        this.genComparisionTableData('');
      }
    }
    console.log("checked Traits", this.checkedTraits);
    console.log("catg level data", this.selectedCatgCnt);
  }
  //fetches the data selection table and category component on page load; and pre-selects the Rank-1 trait 
  getData() {
    //console.log(new Date().getTime());
    var passedData = this.dataService.getData().data.catgLevelData;//In summary commponent we pass data so that while we come back to this component the data remains unchanged and user can change the selections 
    //so if we aren't coming back from summary component we need to fetch the data from java service ;
    if (passedData == undefined) {
      var postData = JSON.parse(JSON.stringify(this.StoreValues));//cloning from an observable by converting it to JSON string 
      //var postData = this.StoreValues.slice();
      //postData["User_ID"] = this.authService.currentUserId;
      postData["Category"] = '-1';
      this.fetchDataService.postService(this.url, [postData]).subscribe(data => {
        //data = JSON.parse(JSON.stringify(data));
        //this.allCatgData = JSON.parse(JSON.stringify(data["values"]));
        this.allCatgData = data["values"];
        //this.sortedData = this.allCatgData.slice();
        this.catgList = data["catgList"];
      },

        // error callback handles the error in the http request
        (err) => console.error(err.message),
        // The 3rd callback handles the "complete" event.
        () => {
          console.log("data fetch completed");
          for (var i = 0; i < this.allCatgData.length; i++) {
            this.allCatgData[i]["index"] = i;
           if (this.allCatgData[i].Existing == "Y") {
              this.existingModular[this.allCatgData[i].Category] = this.allCatgData[i];
            }
            if (this.allCatgData[i]["Rank"] == 1) {
              this.allCatgData[i]["selected"] = 1;
              if (this.selectedCatgCnt[this.allCatgData[i]["Category"]] == undefined) {
                this.selectedCatgCnt[this.allCatgData[i]["Category"]] = { "count": 1, "Min": this.allCatgData[i]["Min"], "Max": this.allCatgData[i]["Max"] };
              }
              else {
                this.selectedCatgCnt[this.allCatgData[i]["Category"]].count += 1;
              }
              this.checkedTraits[this.checkedTraits.length++](this.allCatgData[i]);
              //this.summaryData[this.checkedTraits.length++](this.allCatgData[i]);
            }
          }
          this.displayedColumns_SelectionTable = ["Category", "Category_Name", "Min", "Max", "Trait_Nbr", "Trait_Name", "UDF_1", "UDF_2", "UDF_3", "Existing", "Rank", "Market_Sales_$_Coverage", "Market_Sales_Quantity_Coverage", "Mod_UPSPW", "Mod_SPSPW", "Store_Count", "Store_Count_DMA", "UPC_Count", "UPC_DC_Percentage", "UPC_Nielsen_Percentage"];
          this.RowWidth = String(120 * (this.displayedColumns_SelectionTable.length + 1)) + 'px';
          this.catgLevelData['-1'] = this.allCatgData;
          this.catgPickerList = this.catgPicker.genCatgList(this.catgList, this.catgPickerLength);
          // this.displayedColumns_SelectionTable = Object.keys(this.allCatgData[0]);
          this.dataSource_SelectionTable = new MatTableDataSource<any>(this.allCatgData);
        }
      );

    }
    else {
      // this condition is true when we return from summary table hence we use the data we passed to summary component again .
      this.catgLevelData = passedData;
      this.allCatgData = this.catgLevelData["-1"];
      this.catgList = this.dataService.getData().data.catgList;
      this.catgPickerList = this.catgPicker.genCatgList(this.catgList, this.catgPickerLength);
      this.existingModular = this.dataService.getData().data.existingModular;
      this.displayedColumns_SelectionTable = Object.keys(this.allCatgData[0]);
      this.dataSource_SelectionTable = new MatTableDataSource<any>(this.allCatgData);
      this.RowWidth = String(120 * (this.displayedColumns_SelectionTable.length + 1)) + 'px';
      this.selectedCatgCnt = this.dataService.getData().data.selectedCatgCnt;
      this.checkedTraits = this.dataService.getData().data.checkedTraits;
      this.genComparisionTableData(this.checkedTraits[this.checkedTraits.length - 1]);
    }
    console.log(this.existingModular, "existingmodular")
  }
  //filters the data on click of category numbers 
  getCurCatgData(category: any) {
    if (this.currentCatgNumber == '-1') {
      this.catgLevelData['-1'] = this.dataSource_SelectionTable.data;
    }
    if (this.catgLevelData[category] == undefined) {
      this.catgLevelData[category] = [];
      for (var i = 0; i < this.catgLevelData['-1'].length; i++) {
        if (this.catgLevelData['-1'][i].Category == category) {
          this.catgLevelData[category].push(this.catgLevelData['-1'][i]);
        }
      }
    }
    this.currentCatgNumber = category;
    this.dataSource_SelectionTable.data = this.catgLevelData[category];
    this.genComparisionTableData('');
  }

  previous() {
    this.catgPickerList = this.catgPicker.previous();

  }
  next() {
    this.catgPickerList = this.catgPicker.next()
  }
  first() {
    this.catgPickerList = this.catgPicker.first()
  }
  last() {
    this.catgPickerList = this.catgPicker.last()

  }
  //allows the user to save the selected traits to the database and checks if the user has cleared all the violations to be able to proceed to summary
  saveButton() {
    this.summaryData = this.checkedTraits.slice();
    if (this.summaryData.length > 0) {
      var countCategories = {};
      var violations = [];
      var previousCat = -1;
      console.log("countCategories", countCategories);
      var categories = Object.keys(this.selectedCatgCnt);
      for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        if (this.selectedCatgCnt[category]["count"] < this.selectedCatgCnt[category]["Min"]) {
          var violated;
          violated = {};
          violated["Category"] = category;
          violated["Min"] = this.selectedCatgCnt[category]["Min"];
          violated["Selected"] = this.selectedCatgCnt[category]["count"];
          violations.push(violated);
          this.openSnackBar("Violation for Category:" + category, "Min is " + this.selectedCatgCnt[category]["Min"]);
        }
        else if (this.selectedCatgCnt[category]["count"] > this.selectedCatgCnt[category]["Max"]) {
          var violated;
          violated = {}
          violated["Category"] = category;
          violated["Max"] = this.selectedCatgCnt[category]["Max"];
          violated["Selected"] = this.selectedCatgCnt[category]["count"];
          violations.push(violated);
          this.openSnackBar("Violation for Category:" + category, "Max is " + this.selectedCatgCnt[category]["Max"]);
        }
      }
      console.log("violations",
        violations);
      if (violations.length > 0) {

        this.hideButton = 1;
        // this.openSnackBar("Please validate the 'MIN', 'MAX' conditions for all categories" , "Close");
      }
      else {
        this.openSnackBar("Please validate the 'MIN', 'MAX' conditions for all categories", "Close");
        this.hideButton = 0;

        var postData = JSON.parse(JSON.stringify(this.summaryData));
        for (var i = 0; i < postData.length; i++) {
          postData[i]["Store_Nbr"] = this.StoreValues["Store_Nbr"];
          postData[i]["Department"] = this.StoreValues["Department"];
          postData[i]["Create_Deadline"] = this.StoreValues["Create_Deadline"];
          postData[i]["Future_Trait_Effective_Date"] = this.StoreValues["Future_Trait_Effective_Date"];
          postData[i]["LoggedInUser_ID"] = this.authService.currentUserId;
          postData[i]["User_ID"] = this.dataService.getData()["data"].storeValues.User_ID;

        }
        console.log(postData, "save");
        this.fetchDataService.postService(this.saveUrl, postData).subscribe(data => {
          console.log(data);

        });
      }
    }
    else {
      this.openSnackBar("No Traits Selected", "Close");
      this.hideButton = 1;
    }

    //this.data = this.dataService.getData()["data"];
  }

  clearSelected() {
    for (var i = 0; i < this.catgLevelData["-1"].length; i++) {
      this.catgLevelData["-1"][i].selected = 0;
    }
    this.checkedTraits = [];
    this.selectedCatgCnt = {};
  }
  //allows the user to move to the summary screen
  summaryButton() {
    var existingSummaryData = [];
    var dataToPass = {
      "storeValues": this.StoreValues.slice(), "summaryData": this.summaryData.slice(), "existingModular": this.existingModular, "catgList": this.catgList.slice(),
      "catgLevelData": this.catgLevelData, "checkedTraits": this.checkedTraits.slice(), "selectedCatgCnt": this.selectedCatgCnt
    };
    this.dataService.dataPass(dataToPass, this.dataService.getData().page);
    this.router.navigate(["/summary"]);
    console.log("passed data", dataToPass);
  }
  //allows to user to go back to the previous page
  goBack() {
    var prevPage = this.dataService.getData().page;
    this.router.navigate([prevPage]);
  }
  
  ngOnInit() {
    this.getData()
  }

  ngAfterViewInit(){
    this.paginator.changes.subscribe(paginator=>{
      console.log(paginator.first);
      this.dataSource_SelectionTable.paginator=paginator.first;
      this.pageIndex = this.dataSource_SelectionTable.paginator._pageIndex ;
      this.pageSize=this.dataSource_SelectionTable.paginator._pageSize ;
   
    })
  }
}

