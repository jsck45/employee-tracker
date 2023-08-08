INSERT INTO department (id, name)
VALUES
    ( 1, "Sales"),
    ( 2, "Engineering"),
    ( 3, "Finance"),
    ( 4, "Legal");

INSERT INTO role (id, title, salary)
VALUES
    ( 1, "Sales Lead", "100000"),
    ( 2, "Salesperson", "80000"),
    ( 3, "Lead Engineer", "150000"),
    ( 4, "Software Engineer", "120000"),
    ( 5, "Account Manager", "160000"),
    ( 6, "Accountant", "125000"),
    ( 7, "Legal Team Lead", "250000"),
    ( 8, "Lawyer", "190000"),

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
    -- ( 1, "apple"),
    -- ( 2, "orange"),
    -- ( 3, "banana");