import { ODSPaginationTableChangeEventOptions, ODSTable, ODSTableBody, ODSTableHead, ODSTableHeadCell, ODSTableHeadCellProps, ODSTableHeadCellType, ODSTableHeadRow, ODSTableRow, ODSTableRowCell, ODSTableRowCellProps, ODSTableRowProps } from "@telekom-ods/react-ui-kit";
import { orderBy } from "lodash";
import { FC, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Dic } from "~/Helpers/Entities";
import reviewsHistoryMock from "./reviewsHistoryMock.json";

/**
 * @author Aloento
 * @since 1.3.0
 * @version 0.2.0
 */
export function Reviews() {
  const [order, setOrder] = useState<"asc" | "desc" | undefined>();
  const [orderByIndex, setOrderByIndex] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleSortChange = (index: number) => {
    let newOrder: "asc" | "desc" | undefined;
    let newOrderByIndex: number | undefined;

    if (orderByIndex !== index) {
      newOrder = "asc";
      newOrderByIndex = index;
    } else {
      newOrder = order === "asc" ? "desc" : undefined;
      newOrderByIndex = order === "asc" ? index : undefined;
    }

    setOrder(newOrder);
    setOrderByIndex(newOrderByIndex);
  };

  const generateRowDataSort = (
    cellsProps: ODSTableRowCellProps[]
  ): Record<number, string | number> =>
    cellsProps.reduce<Record<number, string | number>>(
      (dataSort, cellProps, index) => {
        dataSort[index] = cellProps["data-sort-content"] as string | number;
        return dataSort;
      },
      {}
    );

  const paginationChange = (event: ODSPaginationTableChangeEventOptions) => {
    if (page !== event.page) setPage(event.page);
    if (pageSize !== event.pageSize) setPageSize(event.pageSize);
  };

  const tableHeadRowCells: ODSTableHeadCellProps[] = [
    { id: "head_cell_0", label: "ID", alignment: "left" },
    { id: "head_cell_1", label: "Plan Start CET" },
    { id: "head_cell_2", label: "Plan End CET" },
    { id: "head_cell_3", label: "Region" },
    { id: "head_cell_4", label: "Service" },
    {
      id: "head_cell_5",
      label: "Detail",
      alignment: "right",
      showSortIndicator: false,
    },
  ];

  type ReviewsHistoryItem = {
    id: number;
    planStartCET: string;
    planEndCET: string;
    region: string;
    service: string;
  };

  const historyItems = reviewsHistoryMock as ReviewsHistoryItem[];

  const tableRowCells: Record<number, ODSTableRowCellProps[]> = historyItems.reduce(
    (rows, item, index) => {
      rows[index] = [
        {
          id: `row_${index}_cell_0`,
          type: "label",
          label: item.id,
          "data-sort-content": item.id,
        },
        {
          id: `row_${index}_cell_1`,
          type: "label",
          label: item.planStartCET,
          "data-sort-content": item.planStartCET,
        },
        {
          id: `row_${index}_cell_2`,
          type: "label",
          label: item.planEndCET,
          "data-sort-content": item.planEndCET,
        },
        {
          id: `row_${index}_cell_3`,
          type: "label",
          label: item.region,
          "data-sort-content": item.region,
        },
        {
          id: `row_${index}_cell_4`,
          type: "label",
          label: item.service,
          "data-sort-content": item.service,
        },
        {
          id: `row_${index}_cell_5`,
          type: "action",
          alignment: "right",
          actionProps: {
            ariaLabel: "View Event Details",
            buttonIcon: "more-type-bold",
            buttonType: "link",
            size: "small",
            variant: "ghost",
            href: `/Event/${item.id}`,
            leftIcon: true
          }
        },
      ];
      return rows;
    },
    {} as Record<number, ODSTableRowCellProps[]>
  );

  const tableRows: ODSTableRowProps[] = historyItems.map((_, index) => ({
    id: `row_${index}`,
    "aria-rowindex": index,
  }));

  type ProductRow = {
    props: ODSTableRowProps;
    cells: ODSTableRowCellProps[];
  };

  const generateProductRow = (
    rowProps: ODSTableRowProps,
    cells: ODSTableRowCellProps[]
  ): ProductRow => {
    return {
      props: {
        ...rowProps,
        "data-sort": generateRowDataSort(cells),
      },
      cells,
    };
  };

  const productRows = tableRows.map((rowProps, index) =>
    generateProductRow(rowProps, tableRowCells[index])
  );

  type ProductTableHeadProps = {
    onSort: (index: number) => void;
  };

  const ProductTableHead: FC<ProductTableHeadProps> = ({
    onSort,
    ...rest
  }) => {
    const getCellType = (index: number): ODSTableHeadCellType => {
      if (orderByIndex !== index) return "unsorted";
      if (order === "asc") return "sortedUp";
      return "sortedDown";
    };

    return (
      <ODSTableHead {...rest}>
        <ODSTableHeadRow>
          {tableHeadRowCells.map((props, cellIndex) => (
            <ODSTableHeadCell
              {...props}
              key={props.id}
              type={getCellType(cellIndex)}
              onSort={() => onSort(cellIndex)}
            />
          ))}
        </ODSTableHeadRow>
      </ODSTableHead>
    );
  };

  const sortProductRows = (productRows: ProductRow[]): ProductRow[] => {
    if (!order) return productRows;

    return orderBy(
      productRows,
      (productRow) =>
        (productRow.props["data-sort"] as Record<number, string | number>)[
        orderByIndex ?? -1
        ],
      [order]
    );
  };

  const visibleProductRows = useMemo(
    () => [
      ...sortProductRows(productRows).slice(
        page * pageSize,
        page * pageSize + pageSize
      ),
    ],
    [order, orderByIndex, page, pageSize]
  );

  return (
    <>
      <Helmet>
        <title>Reviews - {Dic.Name} {Dic.Prod}</title>
      </Helmet>

      <h3 className="text-3xl font-medium text-slate-800">Pending Review Maintenances</h3>

      <ODSTable
        onPaginationChange={paginationChange}
        aria-rowcount={productRows.length}
        initialPage={0}
        initialPageSize={10}
        pagination
        pageSizeOptions={[10, 20, 50]}
      >
        <ProductTableHead
          onSort={handleSortChange}
        />
        <ODSTableBody>
          {visibleProductRows.map(({ props: rowProps, cells }) => (
            <ODSTableRow
              {...rowProps}
              key={rowProps.id}
            >
              {cells.map((cellProps) => (
                <ODSTableRowCell {...cellProps} key={cellProps.id} />
              ))}
            </ODSTableRow>
          ))}
        </ODSTableBody>
      </ODSTable>
    </>
  );
}
